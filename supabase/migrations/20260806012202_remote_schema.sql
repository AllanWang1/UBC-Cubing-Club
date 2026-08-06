-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

DROP EXTENSION pg_graphql;

CREATE ROLE supabase_privileged_role;

GRANT supabase_privileged_role TO postgres;

CREATE EXTENSION pgjwt WITH SCHEMA extensions;

CREATE EXTENSION pgsodium;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE TYPE public.comp_format AS ENUM (
  'head-to-head',
  'BO1',
  'MO3',
  'AO5',
  'BO3'
);

COMMENT ON TYPE public.comp_format IS 'competition format ';

CREATE TYPE public.faculties AS ENUM (
  'Applied Science',
  'Architecture and Landscape Architecture',
  'Arts',
  'Audiology and Speech Sciences',
  'Business',
  'Community and Regional Planning',
  'Dentistry',
  'Education',
  'Extended Learning',
  'Forestry',
  'Graduate and Postdoctoral Studies',
  'Journalism',
  'Kinesiology',
  'Land and Food Systems',
  'Law',
  'Library, Archival and Information Studies',
  'Medicine',
  'Music',
  'Nursing',
  'Pharmaceutical Sciences',
  'Population and Public Health',
  'Public Policy and Global Affairs',
  'Science',
  'Social Work',
  'UBC Vantage College',
  'Vancouver School of Economics',
  'External'
);

COMMENT ON TYPE public.faculties IS 'Faculties/school of study';

CREATE TYPE public.meeting_status AS ENUM (
  'open',
  'closed'
);

COMMENT ON TYPE public.meeting_status IS 'open or closed';

CREATE TYPE public.penalties AS ENUM (
  '+2',
  'DNF',
  '+4',
  '+6',
  'DNS'
);

COMMENT ON TYPE public.penalties IS 'penalties that can be applied to a solve';

CREATE FUNCTION public.all_member_records()
  RETURNS TABLE (
    id                  integer,
    name                text,
    faculty_full_name   text,
    faculty_icon_link   text,
    cube_name           text,
    icon_link           text,
    cube_order          integer,
    single_time_ms      integer,
    single_rank         integer,
    single_meeting_id   integer,
    single_meeting_name text,
    avg_time_ms         integer,
    avg_rank            integer,
    avg_meeting_id      integer,
    avg_meeting_name    text
  )
  LANGUAGE sql
  AS $function$
WITH ranked_attempts AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    time_ms,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms
    ) AS rank_asc,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms DESC
    ) AS rank_desc
  FROM public."Results"
),

valid_groups AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    COUNT(*) AS attempt_count
  FROM public."Results"
  GROUP BY id, cube_name, meeting_id, round
  HAVING COUNT(*) IN (3, 5)  -- Only groups with 3 or 5 attempts
),

-- Averages computed per member per meeting (using drop-best/worst for 5-attempt groups,
-- simple mean for 3-attempt groups for special cubes)
average_data AS (

  -- 5-attempt groups: drop best & worst
  SELECT 
    r.id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms)::integer AS calculated_average
  FROM ranked_attempts r
  JOIN valid_groups v 
    ON r.id = v.id 
   AND r.cube_name = v.cube_name 
   AND r.meeting_id = v.meeting_id 
   AND r.round = v.round
  WHERE r.rank_asc > 1 AND r.rank_desc > 1
    AND v.attempt_count = 5
  GROUP BY r.id, r.cube_name, r.meeting_id, r.round

  UNION ALL

  -- 3-attempt groups (special cubes): simple average across the 3 attempts
  SELECT 
    r.id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms)::integer AS calculated_average
  FROM public."Results" r
  JOIN valid_groups v 
    ON r.id = v.id 
   AND r.cube_name = v.cube_name 
   AND r.meeting_id = v.meeting_id 
   AND r.round = v.round
  WHERE v.attempt_count = 3
    AND r.cube_name IN ('6x6', '7x7', '3x3 BLD', 'FMC')
  GROUP BY r.id, r.cube_name, r.meeting_id, r.round
),

-- For each member+cube, choose the best average (lowest) across meetings.
member_best_averages AS (
  -- find the minimum average per member+cube
  SELECT
    ma.id,
    ma.cube_name,
    ma.min_avg AS avg_time_ms,
    -- choose the smallest meeting_id among ties for determinism
    MIN(ad.meeting_id) AS meeting_id
  FROM (
    SELECT id, cube_name, MIN(calculated_average) AS min_avg
    FROM average_data
    GROUP BY id, cube_name
  ) ma
  JOIN average_data ad
    ON ad.id = ma.id
   AND ad.cube_name = ma.cube_name
   AND ad.calculated_average = ma.min_avg
  GROUP BY ma.id, ma.cube_name, ma.min_avg
),

-- Rank the member best averages per cube (ties preserved, next rank skipped)
best_averages_ranked AS (
  SELECT
    mba.id,
    mba.cube_name,
    mba.avg_time_ms,
    mba.meeting_id AS avg_meeting_id,
    mt.meeting_name AS avg_meeting_name,
    RANK() OVER (PARTITION BY mba.cube_name ORDER BY mba.avg_time_ms) AS avg_rank
  FROM member_best_averages mba
  LEFT JOIN public."Meetings" mt ON mba.meeting_id = mt.meeting_id
),

-- For singles: compute each member's best single time per cube
member_best_singles AS (
  SELECT
    r.id,
    r.cube_name,
    MIN(r.time_ms) AS single_time_ms
  FROM public."Results" r
  WHERE r.time_ms > 0
  GROUP BY r.id, r.cube_name
),

-- Attach a deterministic meeting_id (smallest meeting_id) for that best single when ties exist
member_best_singles_with_meeting AS (
  SELECT
    bs.id,
    bs.cube_name,
    bs.single_time_ms,
    MIN(r.meeting_id) AS meeting_id
  FROM member_best_singles bs
  JOIN public."Results" r
    ON r.id = bs.id
   AND r.cube_name = bs.cube_name
   AND r.time_ms = bs.single_time_ms
  GROUP BY bs.id, bs.cube_name, bs.single_time_ms
),

-- Rank the member best singles per cube (ties preserved, next rank skipped)
best_singles_ranked AS (
  SELECT
    s.id,
    m.name,
    m.faculty,
    s.cube_name,
    s.single_time_ms,
    s.meeting_id AS single_meeting_id,
    mt.meeting_name AS single_meeting_name,
    RANK() OVER (PARTITION BY s.cube_name ORDER BY s.single_time_ms) AS single_rank
  FROM member_best_singles_with_meeting s
  JOIN public."Members" m ON s.id = m.id
  LEFT JOIN public."Meetings" mt ON s.meeting_id = mt.meeting_id
)

SELECT 
  bsr.id,
  bsr.name,
  f.faculty_full_name,
  f.faculty_icon_link,
  bsr.cube_name,
  c.icon_link,
  c.order AS cube_order,

  -- Single fields (from per-member best single)
  bsr.single_time_ms,
  bsr.single_rank,
  bsr.single_meeting_id,
  bsr.single_meeting_name,

  -- Average fields (from per-member best average, if any)
  bar.avg_time_ms,
  bar.avg_rank,
  bar.avg_meeting_id,
  bar.avg_meeting_name

FROM best_singles_ranked bsr
LEFT JOIN best_averages_ranked bar
  ON bsr.id = bar.id
 AND bsr.cube_name = bar.cube_name
JOIN public."Cubes" c ON bsr.cube_name = c.cube_name
JOIN public."Faculties" f ON bsr.faculty = f.faculty_name
ORDER BY c.order, bsr.single_rank, bar.avg_rank;
$function$;

GRANT ALL ON FUNCTION public.all_member_records() TO anon;

GRANT ALL ON FUNCTION public.all_member_records() TO authenticated;

GRANT ALL ON FUNCTION public.all_member_records() TO service_role;

CREATE FUNCTION public.all_member_results (
  member_id integer
)
  RETURNS TABLE (
    cube_name           text,
    icon_link           text,
    cube_order          integer,
    meeting_name        text,
    round               integer,
    member_id           integer,
    name                text,
    avg_time_ms         integer,
    best_single_time_ms integer,
    place_in_round      integer,
    all_times           integer[]
  )
  LANGUAGE sql
  AS $function$

WITH all_groups AS (
  SELECT 
    id AS member_id,
    cube_name,
    meeting_id,
    round,
    COUNT(*) AS attempt_count
  FROM public."Results"
  GROUP BY id, cube_name, meeting_id, round
),

ranked_attempts AS (
  SELECT 
    r.id AS member_id,
    r.cube_name,
    r.meeting_id,
    r.round,
    r.time_ms,
    ROW_NUMBER() OVER (
      PARTITION BY r.id, r.cube_name, r.meeting_id, r.round 
      ORDER BY r.time_ms
    ) AS rank_asc,
    ROW_NUMBER() OVER (
      PARTITION BY r.id, r.cube_name, r.meeting_id, r.round 
      ORDER BY r.time_ms DESC
    ) AS rank_desc
  FROM public."Results" r
),

average_data AS (
  -- Drop best & worst for 5-attempt non-exceptional events
  SELECT 
    r.member_id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms) AS average_time
  FROM ranked_attempts r
  JOIN all_groups g ON 
    r.member_id = g.member_id AND 
    r.cube_name = g.cube_name AND 
    r.meeting_id = g.meeting_id AND 
    r.round = g.round
  WHERE g.attempt_count = 5
    AND r.rank_asc > 1 AND r.rank_desc > 1
    AND r.cube_name NOT IN ('6x6', '7x7', '3x3 BLD', 'FMC')
  GROUP BY r.member_id, r.cube_name, r.meeting_id, r.round

  UNION ALL

  -- Simple mean for 3-attempt exceptional events
  SELECT 
    r.member_id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms) AS average_time
  FROM ranked_attempts r
  JOIN all_groups g ON 
    r.member_id = g.member_id AND 
    r.cube_name = g.cube_name AND 
    r.meeting_id = g.meeting_id AND 
    r.round = g.round
  WHERE g.attempt_count = 3
    AND r.cube_name IN ('6x6', '7x7', '3x3 BLD', 'FMC')
  GROUP BY r.member_id, r.cube_name, r.meeting_id, r.round
),

base_rounds AS (
  SELECT 
    r.id AS member_id,
    m.name,
    r.cube_name,
    r.meeting_id,
    mt.meeting_name,
    r.round,
    ARRAY_AGG(r.time_ms ORDER BY r.attempt) AS all_times,
    MIN(r.time_ms) AS best_single_time
  FROM public."Results" r
  JOIN public."Members" m ON r.id = m.id
  JOIN public."Meetings" mt ON r.meeting_id = mt.meeting_id
  GROUP BY r.id, m.name, r.cube_name, r.meeting_id, mt.meeting_name, r.round
),

merged_data AS (
  SELECT 
    br.*,
    ad.average_time
  FROM base_rounds br
  LEFT JOIN average_data ad ON 
    br.member_id = ad.member_id AND 
    br.cube_name = ad.cube_name AND 
    br.meeting_id = ad.meeting_id AND 
    br.round = ad.round
),

-- ranked_final AS (
--   SELECT *,
--     CASE 
--       WHEN average_time IS NOT NULL THEN 
--         RANK() OVER (PARTITION BY cube_name, meeting_id, round ORDER BY average_time)
--       ELSE 
--         RANK() OVER (PARTITION BY cube_name, meeting_id, round ORDER BY best_single_time)
--     END AS place_in_round
--   FROM merged_data
-- )

ranked_final AS (
  SELECT *,
    RANK() OVER (
      PARTITION BY cube_name, meeting_id, round
      ORDER BY
        CASE
          -- BLD events → only single matters
          WHEN cube_name IN ('3x3 BLD') THEN best_single_time
          
          -- Mean-of-3 events → rank by average_time directly
          WHEN cube_name IN ('6x6','7x7','FMC') THEN average_time
          
          -- For average-of-5 events:
          -- Force anyone WITH an average to rank before anyone without
          ELSE CASE WHEN average_time IS NOT NULL THEN 0 ELSE 1 END
        END,
        CASE
          -- secondary sorting:
          WHEN cube_name IN ('3x3 BLD') THEN NULL
          WHEN cube_name IN ('6x6','7x7','FMC') THEN NULL
          -- if they had an average, sort by average_time
          WHEN average_time IS NOT NULL THEN average_time
          -- if no average, sort by single
          ELSE best_single_time
        END
    ) AS place_in_round
  FROM merged_data
)

SELECT 
  ranked_final.cube_name,
  C.icon_link,
  C.order AS cube_order,
  ranked_final.meeting_name,
  round,
  member_id,
  name,
  ROUND(average_time::numeric, 0) AS avg_time_ms,
  best_single_time AS best_single_time_ms,
  place_in_round,
  all_times
FROM ranked_final
JOIN public."Cubes" C ON ranked_final.cube_name = C.cube_name
JOIN public."Meetings" M ON ranked_final.meeting_id = M.meeting_id
WHERE ranked_final.member_id = member_id
ORDER BY C.order, M.meeting_id DESC, meeting_name, round, place_in_round;

$function$;

GRANT ALL ON FUNCTION public.all_member_results(integer) TO anon;

GRANT ALL ON FUNCTION public.all_member_results(integer) TO authenticated;

GRANT ALL ON FUNCTION public.all_member_results(integer) TO service_role;

CREATE FUNCTION public.approve_pending_results_test (
  p_meeting_id integer
)
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  pending_count integer;
  inserted_count integer;
  deleted_count integer;
begin
  if not exists (
    select 1
    from public."Members" m
    where m.user_id = (select auth.uid())
      and m.role in ('admin', 'president', 'treasurer')
  ) then
    raise exception using
      errcode = '42501',
      message = 'Administrator access required';
  end if;

  select count(*)
  into pending_count
  from public."PendingResults_Test"
  where meeting_id = p_meeting_id;

  if pending_count = 0 then
    raise exception 'No test pending results found';
  end if;

  insert into public."Results_Test" (
    attempt,
    round,
    id,
    cube_name,
    meeting_id,
    time_ms,
    record,
    average_record,
    penalty,
    raw_time_ms
  )
  select
    attempt,
    round,
    id,
    cube_name,
    meeting_id,
    time_ms,
    record,
    average_record,
    penalty,
    raw_time_ms
  from public."PendingResults_Test"
  where meeting_id = p_meeting_id;

  get diagnostics inserted_count = row_count;

  if inserted_count <> pending_count then
    raise exception
      'Expected % inserts, received %',
      pending_count,
      inserted_count;
  end if;

  delete from public."PendingResults_Test"
  where meeting_id = p_meeting_id;

  get diagnostics deleted_count = row_count;

  if deleted_count <> pending_count then
    raise exception
      'Expected % deletions, received %',
      pending_count,
      deleted_count;
  end if;

  return inserted_count;
end;
$function$;

REVOKE ALL ON FUNCTION public.approve_pending_results_test(integer) FROM PUBLIC;

GRANT ALL ON FUNCTION public.approve_pending_results_test(integer) TO authenticated;

GRANT ALL ON FUNCTION public.approve_pending_results_test(integer) TO service_role;

CREATE FUNCTION public.get_next_id()
  RETURNS TABLE (
    id integer
  )
  LANGUAGE sql
  AS $function$
SELECT setval('public."Members_id_seq"', (SELECT MAX(ID) FROM public."Members"));
SELECT last_value + 1 AS ID FROM public."Members_id_seq";
$function$;

GRANT ALL ON FUNCTION public.get_next_id() TO anon;

GRANT ALL ON FUNCTION public.get_next_id() TO authenticated;

GRANT ALL ON FUNCTION public.get_next_id() TO service_role;

CREATE FUNCTION public.get_single_results()
  RETURNS TABLE (
    id           integer,
    name         text,
    time_ms      integer,
    meeting_name text,
    meeting_id   integer,
    cube_name    text,
    icon_link    text
  )
  LANGUAGE sql
  AS $function$
WITH bestSolves AS (
    SELECT M.id, MIN(R.time_ms) AS time_ms, C.cube_name
    FROM public."Members" M
    JOIN public."Results" R ON M.id = R.id
    JOIN public."Cubes" C ON C.cube_name = R.cube_name
    GROUP BY M.id, C.cube_name
    HAVING MIN(R.time_ms) > 0
  )
--Does not produce negative values up until this point.

SELECT DISTINCT R.id, M.name, BS.time_ms, MT.meeting_name, MT.meeting_id, R.cube_name, C.icon_link
FROM public."Members" M, public."Results" R, public."Cubes" C, bestSolves BS, public."Meetings" MT
WHERE M.id = BS.id AND R.id = M.id AND MT.meeting_id = R.meeting_id AND C.cube_name = R.cube_name AND R.cube_name = BS.cube_name AND R.time_ms = BS.time_ms
ORDER BY BS.time_ms
$function$;

GRANT ALL ON FUNCTION public.get_single_results() TO anon;

GRANT ALL ON FUNCTION public.get_single_results() TO authenticated;

GRANT ALL ON FUNCTION public.get_single_results() TO service_role;

CREATE FUNCTION public.leaderboard_results()
  RETURNS TABLE (
    id        integer,
    time_ms   integer,
    cube_name text
  )
  LANGUAGE sql
  AS $function$
  SELECT M.id,  R.time_ms, C.cube_name
  FROM public."Results" R, public."Members" M, public."Cubes" C
  
$function$;

GRANT ALL ON FUNCTION public.leaderboard_results() TO anon;

GRANT ALL ON FUNCTION public.leaderboard_results() TO authenticated;

GRANT ALL ON FUNCTION public.leaderboard_results() TO service_role;

CREATE FUNCTION public.member_average_results (
  member_id integer
)
  RETURNS TABLE (
    id        integer,
    name      text,
    time_ms   integer,
    cube_name text,
    icon_link text,
    rank      integer
  )
  LANGUAGE sql
  AS $function$

WITH ranked_attempts AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    time_ms,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms
    ) as rank_asc,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms DESC
    ) as rank_desc
  FROM public."Results"
),

valid_groups AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    COUNT(*) as attempt_count
  FROM public."Results"
  GROUP BY id, cube_name, meeting_id, round
  HAVING COUNT(*) = 5  -- Only groups with exactly 5 attempts
),

average_data AS (
  SELECT 
    r.id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms) as calculated_average
  FROM ranked_attempts r
  JOIN valid_groups v ON 
    r.id = v.id AND 
    r.cube_name = v.cube_name AND 
    r.meeting_id = v.meeting_id AND 
    r.round = v.round
  WHERE r.rank_asc > 1 AND r.rank_desc > 1  -- Exclude one fastest and one slowest
  GROUP BY r.id, r.cube_name, r.meeting_id, r.round
)
-- this is for all the members
-- SELECT 
--   a.id,
--   a.cube_name,
--   a.meeting_id,
--   a.round,
--   a.calculated_average as time_ms
-- FROM average_data a
-- ORDER BY a.calculated_average;

SELECT foo.id, M.name, foo.time_ms, foo.cube_name, C.icon_link, foo.rank
-- Safe to do the above partition since we are selecting the MIN(a.calculated_average) below, so there should only be one entry per person per event.
FROM (
SELECT 
  a.id,
  a.cube_name,
  MIN(a.calculated_average) as time_ms,
  RANK() OVER (PARTITION BY a.cube_name ORDER BY MIN(a.calculated_average)) AS rank
FROM average_data a
GROUP BY a.id, a.cube_name
ORDER BY MIN(a.calculated_average)
) AS foo, public."Cubes" C, public."Members" M
WHERE foo.cube_name = C.cube_name AND foo.id = M.id AND M.id=member_id;
$function$;

GRANT ALL ON FUNCTION public.member_average_results(integer) TO anon;

GRANT ALL ON FUNCTION public.member_average_results(integer) TO authenticated;

GRANT ALL ON FUNCTION public.member_average_results(integer) TO service_role;

CREATE FUNCTION public.member_results (
  member_id integer
)
  RETURNS TABLE (
    id                  integer,
    name                text,
    faculty_full_name   text,
    faculty_icon_link   text,
    cube_name           text,
    icon_link           text,
    single_time_ms      integer,
    single_rank         integer,
    single_meeting_id   integer,
    single_meeting_name text,
    avg_time_ms         integer,
    avg_rank            integer,
    avg_meeting_id      integer,
    avg_meeting_name    text
  )
  LANGUAGE sql
  AS $function$
WITH ranked_attempts AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    time_ms,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms
    ) as rank_asc,
    ROW_NUMBER() OVER (
      PARTITION BY id, cube_name, meeting_id, round 
      ORDER BY time_ms DESC
    ) as rank_desc
  FROM public."Results"
),

valid_groups AS (
  SELECT 
    id,
    cube_name,
    meeting_id,
    round,
    COUNT(*) as attempt_count
  FROM public."Results"
  GROUP BY id, cube_name, meeting_id, round
  HAVING COUNT(*) IN (3, 5)  -- Only groups with 3 or 5 attempts
),

average_data AS (

  -- For 5-attempt cubes (standard method)
  SELECT 
    r.id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms) as calculated_average
  FROM ranked_attempts r
  JOIN valid_groups v ON 
    r.id = v.id AND 
    r.cube_name = v.cube_name AND 
    r.meeting_id = v.meeting_id AND 
    r.round = v.round
  WHERE r.rank_asc > 1 AND r.rank_desc > 1  -- Drop best & worst
    AND v.attempt_count = 5
  GROUP BY r.id, r.cube_name, r.meeting_id, r.round

  UNION ALL

  -- For 3-attempt cubes (simple average)
  SELECT 
    r.id,
    r.cube_name,
    r.meeting_id,
    r.round,
    AVG(r.time_ms) as calculated_average
  FROM public."Results" r
  JOIN valid_groups v ON 
    r.id = v.id AND 
    r.cube_name = v.cube_name AND 
    r.meeting_id = v.meeting_id AND 
    r.round = v.round
  WHERE v.attempt_count = 3
    AND r.cube_name IN ('6x6', '7x7', '3x3 BLD', 'FMC')
  GROUP BY r.id, r.cube_name, r.meeting_id, r.round
),

best_averages AS (
  SELECT DISTINCT ON (a.id, a.cube_name)
    a.id,
    a.cube_name,
    a.meeting_id,
    a.calculated_average AS avg_time_ms
  FROM average_data a
  ORDER BY a.id, a.cube_name, a.calculated_average
),

best_singles AS (
  SELECT DISTINCT ON (M.id, R.cube_name)
    M.id,
    M.name,
    M.faculty,
    R.cube_name,
    R.time_ms AS single_time_ms,
    R.meeting_id
  FROM public."Members" M
  JOIN public."Results" R ON M.id = R.id
  WHERE R.time_ms > 0
  ORDER BY M.id, R.cube_name, R.time_ms
),

ranked_singles AS (
  SELECT 
    bs.*,
    mt.meeting_name AS single_meeting_name,
    RANK() OVER (PARTITION BY bs.cube_name ORDER BY bs.single_time_ms) AS single_rank
  FROM best_singles bs
  LEFT JOIN public."Meetings" mt ON bs.meeting_id = mt.meeting_id
),

ranked_averages AS (
  SELECT 
    ba.*,
    mt.meeting_name AS avg_meeting_name,
    RANK() OVER (PARTITION BY ba.cube_name ORDER BY ba.avg_time_ms) AS avg_rank
  FROM best_averages ba
  LEFT JOIN public."Meetings" mt ON ba.meeting_id = mt.meeting_id
)

SELECT 
  s.id,
  s.name,
  f.faculty_full_name,
  f.faculty_icon_link,
  s.cube_name,
  c.icon_link,
  
  -- Single result fields
  s.single_time_ms,
  s.single_rank,
  s.meeting_id AS single_meeting_id,
  s.single_meeting_name,

  -- Average result fields
  ra.avg_time_ms,
  ra.avg_rank,
  ra.meeting_id AS avg_meeting_id,
  ra.avg_meeting_name

FROM ranked_singles s
LEFT JOIN ranked_averages ra ON s.id = ra.id AND s.cube_name = ra.cube_name
JOIN public."Cubes" c ON s.cube_name = c.cube_name
JOIN public."Faculties" f ON s.faculty = f.faculty_name
WHERE s.id = member_id
ORDER BY c.order, s.single_rank;
$function$;

GRANT ALL ON FUNCTION public.member_results(integer) TO anon;

GRANT ALL ON FUNCTION public.member_results(integer) TO authenticated;

GRANT ALL ON FUNCTION public.member_results(integer) TO service_role;

CREATE FUNCTION public.member_single_results (
  member_id integer
)
  RETURNS TABLE (
    id        integer,
    name      text,
    time_ms   integer,
    cube_name text,
    icon_link text,
    rank      integer
  )
  LANGUAGE sql
  AS $function$

SELECT id, name, time_ms, C.cube_name, C.icon_link, rank
FROM (
SELECT M.id, M.name, MIN(R.time_ms) as time_ms, R.cube_name, RANK() OVER (PARTITION BY R.cube_name ORDER BY MIN(R.time_ms)) AS rank
FROM public."Members" M, public."Results" R
WHERE M.id = R.id
GROUP BY R.cube_name, M.id
HAVING MIN(R.time_ms) > 0
ORDER BY cube_name, MIN(R.time_ms)
) AS foo, public."Cubes" C
WHERE id = member_id AND C.cube_name = foo.cube_name

$function$;

GRANT ALL ON FUNCTION public.member_single_results(integer) TO anon;

GRANT ALL ON FUNCTION public.member_single_results(integer) TO authenticated;

GRANT ALL ON FUNCTION public.member_single_results(integer) TO service_role;

CREATE FUNCTION public.update_user_metadata (
  p_id        uuid,
  p_full_name text,
  p_member_id text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  update auth.users
  set raw_user_meta_data =
    jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(raw_user_meta_data, '{}'::jsonb), -- ensures null safety
          '{member_id}', to_jsonb(p_member_id::text), true
        ),
        '{profilePicURL}', to_jsonb('default1.png'::text), true
      ),
      '{full_name}', to_jsonb(p_full_name::text), true
    )
  where id = p_id;
end;
$function$;

GRANT ALL ON FUNCTION public.update_user_metadata(uuid, text, text) TO anon;

GRANT ALL ON FUNCTION public.update_user_metadata(uuid, text, text) TO authenticated;

GRANT ALL ON FUNCTION public.update_user_metadata(uuid, text, text) TO service_role;

CREATE TABLE public."ClubBasicInformation" (
  id             bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  location       text,
  "time"         text,
  instagram_name text,
  discord_link   text,
  email          text,
  linktree_link  text
);

ALTER TABLE public."ClubBasicInformation"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ClubBasicInformation"
  ADD CONSTRAINT "ClubBasicInformation_pkey" PRIMARY KEY (id);

GRANT ALL ON public."ClubBasicInformation" TO anon;

GRANT ALL ON public."ClubBasicInformation" TO authenticated;

GRANT ALL ON public."ClubBasicInformation" TO service_role;

CREATE POLICY "Allow select ClubBasicInfo" ON public."ClubBasicInformation"
  FOR SELECT
  USING (true);

CREATE TABLE public."ClubExecutiveInformation" (
  id          bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  quote       text   DEFAULT ''::text,
  avatar_path text   DEFAULT ''::text
);

ALTER TABLE public."ClubExecutiveInformation"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ClubExecutiveInformation"
  ADD CONSTRAINT "ClubExecutiveInformation_pkey" PRIMARY KEY (id);

GRANT ALL ON public."ClubExecutiveInformation" TO anon;

GRANT ALL ON public."ClubExecutiveInformation" TO authenticated;

GRANT ALL ON public."ClubExecutiveInformation" TO service_role;

CREATE POLICY "Allow select ClubExecutiveInformation" ON public."ClubExecutiveInformation"
  FOR SELECT
  USING (true);

CREATE TABLE public."ClubExecutivePositions" (
  id         bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  title      text   NOT NULL,
  start_date date   NOT NULL,
  end_date   date
);

COMMENT ON TABLE public."ClubExecutivePositions" IS 'Positions that executives have taken on';

ALTER TABLE public."ClubExecutivePositions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ClubExecutivePositions"
  ADD CONSTRAINT "ClubExecutivePositions_id_fkey" FOREIGN KEY (id) REFERENCES public."ClubExecutiveInformation"(id);

ALTER TABLE public."ClubExecutivePositions"
  ADD CONSTRAINT "ClubExecutivePositions_pkey" PRIMARY KEY (id, title);

GRANT ALL ON public."ClubExecutivePositions" TO anon;

GRANT ALL ON public."ClubExecutivePositions" TO authenticated;

GRANT ALL ON public."ClubExecutivePositions" TO service_role;

CREATE POLICY "Allow select ClubExecutivePositions" ON public."ClubExecutivePositions"
  FOR SELECT
  USING (true);

CREATE TABLE public."Cubes" (
  cube_name          text               NOT NULL,
  icon_link          text               NOT NULL,
  "order"            smallint,
  recommended_format public.comp_format DEFAULT 'AO5'::public.comp_format
);

COMMENT ON TABLE public."Cubes" IS 'Type of puzzle';

COMMENT ON COLUMN public."Cubes".recommended_format IS 'recommended competition format for this cube';

ALTER TABLE public."Cubes"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Cubes"
  ADD CONSTRAINT "Cubes_pkey" PRIMARY KEY (cube_name);

GRANT ALL ON public."Cubes" TO anon;

GRANT ALL ON public."Cubes" TO authenticated;

GRANT ALL ON public."Cubes" TO service_role;

CREATE POLICY "Allow select" ON public."Cubes"
  FOR SELECT
  USING (true);

CREATE TABLE public."Faculties" (
  faculty_name      public.faculties NOT NULL,
  faculty_full_name text,
  faculty_icon_link text
);

COMMENT ON TABLE public."Faculties" IS 'faculties and schools of study';

ALTER TABLE public."Faculties"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Faculties"
  ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY (faculty_name);

GRANT ALL ON public."Faculties" TO anon;

GRANT ALL ON public."Faculties" TO authenticated;

GRANT ALL ON public."Faculties" TO service_role;

CREATE POLICY "Allow select faculty" ON public."Faculties"
  FOR SELECT
  USING (true);

CREATE TABLE public."FormatAttempts" (
  format       public.comp_format DEFAULT 'AO5'::public.comp_format NOT NULL,
  max_attempts smallint           DEFAULT '5'::smallint
);

COMMENT ON TABLE public."FormatAttempts" IS 'Attempts allowed for each format';

ALTER TABLE public."FormatAttempts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."FormatAttempts"
  ADD CONSTRAINT "FormatAttempts_pkey" PRIMARY KEY (format);

ALTER TABLE public."Cubes"
  ADD CONSTRAINT "Cubes_recommended_format_fkey" FOREIGN KEY (recommended_format) REFERENCES public."FormatAttempts"(format);

GRANT ALL ON public."FormatAttempts" TO anon;

GRANT ALL ON public."FormatAttempts" TO authenticated;

GRANT ALL ON public."FormatAttempts" TO service_role;

CREATE POLICY "FormatAttempts grant select" ON public."FormatAttempts"
  FOR SELECT
  USING (true);

CREATE TABLE public."Holds" (
  meeting_id bigint             GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  cube_name  text               NOT NULL,
  format     public.comp_format DEFAULT 'AO5'::public.comp_format NOT NULL,
  rounds     smallint           DEFAULT '1'::smallint NOT NULL
);

COMMENT ON TABLE public."Holds" IS 'Meeting holds event (Cube)';

COMMENT ON COLUMN public."Holds".rounds IS 'How many rounds are hosted';

ALTER TABLE public."Holds"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Holds"
  ADD CONSTRAINT "Holds_cube_name_fkey" FOREIGN KEY (cube_name) REFERENCES public."Cubes"(cube_name) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."Holds"
  ADD CONSTRAINT "Holds_format_fkey" FOREIGN KEY (format) REFERENCES public."FormatAttempts"(format);

ALTER TABLE public."Holds"
  ADD CONSTRAINT "Holds_pkey" PRIMARY KEY (meeting_id, cube_name);

GRANT ALL ON public."Holds" TO anon;

GRANT ALL ON public."Holds" TO authenticated;

GRANT ALL ON public."Holds" TO service_role;

CREATE POLICY "Holds allow DELETE" ON public."Holds"
  FOR DELETE
  USING (true);

CREATE POLICY "Holds allow Insert" ON public."Holds"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Holds allow select" ON public."Holds"
  FOR SELECT
  USING (true);

CREATE TABLE public."Meetings" (
  meeting_id   bigint                GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  date         date                  NOT NULL,
  passcode     character varying,
  description  text,
  meeting_name text,
  tournament   boolean               DEFAULT false NOT NULL,
  status       public.meeting_status DEFAULT 'closed'::public.meeting_status NOT NULL
);

COMMENT ON TABLE public."Meetings" IS 'Meetings in the form of general meetings and tournaments. Times may or may not be recorded at any given meeting.';

COMMENT ON COLUMN public."Meetings".tournament IS 'True if it is a tournament meeting';

ALTER TABLE public."Meetings"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Meetings"
  ADD CONSTRAINT "Meetings_pkey" PRIMARY KEY (meeting_id);

ALTER TABLE public."Holds"
  ADD CONSTRAINT "Holds_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public."Meetings"(meeting_id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT ALL ON public."Meetings" TO anon;

GRANT ALL ON public."Meetings" TO authenticated;

GRANT ALL ON public."Meetings" TO service_role;

CREATE POLICY "Meetings allow select" ON public."Meetings"
  FOR SELECT
  USING (true);

CREATE TABLE public."Members" (
  id         bigint           GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  email      text,
  name       text             DEFAULT 'UBC Cuber'::text NOT NULL,
  membership boolean          DEFAULT false NOT NULL,
  role       text,
  faculty    public.faculties,
  birthdate  date,
  wca_id     text             DEFAULT ''::text NOT NULL,
  user_id    uuid
);

CREATE POLICY "Allow Meeting Admin Insert" ON public."Meetings"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.id = (((auth.jwt() -> 'user_metadata'::text) ->> 'member_id'::text))::integer) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

CREATE POLICY "Allow Update" ON public."Meetings"
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

COMMENT ON TABLE public."Members" IS 'Members of the UBC Cubing Club, may have paid/not paid';

COMMENT ON COLUMN public."Members".name IS 'Name of the member';

COMMENT ON COLUMN public."Members".role IS 'Executive position? Should also be a website admin if there is a value.';

COMMENT ON COLUMN public."Members".faculty IS 'faculty of study';

COMMENT ON COLUMN public."Members".birthdate IS 'Member''s date of birth';

COMMENT ON COLUMN public."Members".wca_id IS 'WCA ID of a member, if they have one.';

ALTER TABLE public."Members"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Members"
  ADD CONSTRAINT "Members_email_key" UNIQUE (email);

ALTER TABLE public."Members"
  ADD CONSTRAINT "Members_id_key" UNIQUE (id);

ALTER TABLE public."Members"
  ADD CONSTRAINT "Members_pkey" PRIMARY KEY (id);

ALTER TABLE public."ClubExecutiveInformation"
  ADD CONSTRAINT "ClubExecutiveInformation_id_fkey" FOREIGN KEY (id) REFERENCES public."Members"(id);

ALTER TABLE public."Members"
  ADD CONSTRAINT "Members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public."Members"
  ADD CONSTRAINT "Members_user_id_key" UNIQUE (user_id);

GRANT ALL ON public."Members" TO anon;

GRANT ALL ON public."Members" TO authenticated;

GRANT ALL ON public."Members" TO service_role;

CREATE POLICY "Allow Members admin insert" ON public."Members"
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.id = (((auth.jwt() -> 'user_metadata'::text) ->> 'member_id'::text))::integer) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

CREATE POLICY "Allow select" ON public."Members"
  FOR SELECT
  USING (true);

CREATE TABLE public."MembershipRequests" (
  user_id    uuid             DEFAULT gen_random_uuid() NOT NULL,
  name       text             DEFAULT ''::text NOT NULL,
  faculty    public.faculties,
  student_id text,
  birthdate  date,
  wca_id     text,
  email      text             DEFAULT ''::text
);

COMMENT ON TABLE public."MembershipRequests" IS 'Requests to become a cubing club member.';

ALTER TABLE public."MembershipRequests"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."MembershipRequests"
  ADD CONSTRAINT "MemberRequest_faculty_fkey" FOREIGN KEY (faculty) REFERENCES public."Faculties"(faculty_name);

ALTER TABLE public."MembershipRequests"
  ADD CONSTRAINT "MemberRequest_pkey" PRIMARY KEY (user_id);

ALTER TABLE public."MembershipRequests"
  ADD CONSTRAINT "MemberRequest_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT ALL ON public."MembershipRequests" TO anon;

GRANT ALL ON public."MembershipRequests" TO authenticated;

GRANT ALL ON public."MembershipRequests" TO service_role;

CREATE POLICY "Allow Membership Request admin delete" ON public."MembershipRequests"
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.id = (((auth.jwt() -> 'user_metadata'::text) ->> 'member_id'::text))::integer) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

CREATE POLICY "Allow insert" ON public."MembershipRequests"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select" ON public."MembershipRequests"
  FOR SELECT
  USING (true);

CREATE TABLE public."PendingResults_Test" (
  attempt        bigint,
  time_ms        numeric,
  cube_name      text,
  id             bigint,
  meeting_id     bigint,
  round          integer,
  record         boolean,
  average_record boolean,
  penalty        public.penalties,
  raw_time_ms    bigint
);

ALTER TABLE public."PendingResults_Test"
  ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public."PendingResults_Test" TO service_role;

CREATE TABLE public."PendingResults" (
  attempt        bigint           GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  time_ms        numeric          NOT NULL,
  cube_name      text             NOT NULL,
  id             bigint           NOT NULL,
  meeting_id     bigint           NOT NULL,
  round          integer          DEFAULT 1 NOT NULL,
  record         boolean          DEFAULT false NOT NULL,
  average_record boolean          DEFAULT false,
  penalty        public.penalties,
  raw_time_ms    bigint           DEFAULT '0'::bigint NOT NULL
);

ALTER PUBLICATION supabase_realtime ADD TABLE public."PendingResults";

COMMENT ON TABLE public."PendingResults" IS 'The results that are pending, exactly the same format as the Results table';

COMMENT ON COLUMN public."PendingResults".time_ms IS 'DNF is represented with -1';

COMMENT ON COLUMN public."PendingResults".round IS 'Round of competition';

COMMENT ON COLUMN public."PendingResults".record IS 'Is this result a record at the time of posting?';

COMMENT ON COLUMN public."PendingResults".average_record IS 'If this solve is included in the average of the record at the time.';

COMMENT ON COLUMN public."PendingResults".raw_time_ms IS 'the raw, unprocessed time in ms';

ALTER TABLE public."PendingResults"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."PendingResults"
  ADD CONSTRAINT "PendingResults_id_fkey" FOREIGN KEY (id) REFERENCES public."Members"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."PendingResults"
  ADD CONSTRAINT "PendingResults_meeting_id_cube_name_fkey" FOREIGN KEY (meeting_id, cube_name) REFERENCES public."Holds"(meeting_id, cube_name);

ALTER TABLE public."PendingResults"
  ADD CONSTRAINT "PendingResults_pkey" PRIMARY KEY (attempt, cube_name, id, meeting_id, round);

GRANT ALL ON public."PendingResults" TO anon;

GRANT ALL ON public."PendingResults" TO authenticated;

GRANT ALL ON public."PendingResults" TO service_role;

CREATE POLICY "Allow Delete" ON public."PendingResults"
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

CREATE POLICY "Allow insert" ON public."PendingResults"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow select" ON public."PendingResults"
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update " ON public."PendingResults"
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Members" m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (m.role = ANY (ARRAY['admin'::text, 'president'::text, 'treasurer'::text]))))));

CREATE TABLE public."Results_Test" (
  attempt        bigint,
  time_ms        numeric,
  cube_name      text,
  id             bigint,
  meeting_id     bigint,
  round          integer,
  record         boolean,
  average_record boolean,
  penalty        public.penalties,
  raw_time_ms    numeric
);

ALTER TABLE public."Results_Test"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Results_Test"
  ADD CONSTRAINT results_test_unique_attempt UNIQUE (meeting_id, id, cube_name, round, attempt);

GRANT ALL ON public."Results_Test" TO service_role;

CREATE TABLE public."Results" (
  attempt        bigint           GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  time_ms        numeric          NOT NULL,
  cube_name      text             NOT NULL,
  id             bigint           NOT NULL,
  meeting_id     bigint           NOT NULL,
  round          integer          DEFAULT 1 NOT NULL,
  record         boolean          DEFAULT false NOT NULL,
  average_record boolean          DEFAULT false,
  penalty        public.penalties,
  raw_time_ms    numeric          DEFAULT '0'::numeric NOT NULL
);

COMMENT ON TABLE public."Results" IS 'Past solves recorded at meetings';

COMMENT ON COLUMN public."Results".time_ms IS 'DNF is represented with 99999999';

COMMENT ON COLUMN public."Results".round IS 'Round of competition';

COMMENT ON COLUMN public."Results".record IS 'Is this result a record at the time of posting?';

COMMENT ON COLUMN public."Results".average_record IS 'If this solve is included in the average of the record at the time.';

COMMENT ON COLUMN public."Results".penalty IS 'penalties that can be applied to a solve.';

COMMENT ON COLUMN public."Results".raw_time_ms IS 'raw time in ms before processing.';

ALTER TABLE public."Results"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Results"
  ADD CONSTRAINT "Results_id_fkey" FOREIGN KEY (id) REFERENCES public."Members"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."Results"
  ADD CONSTRAINT "Results_meeting_id_cube_name_fkey" FOREIGN KEY (meeting_id, cube_name) REFERENCES public."Holds"(meeting_id, cube_name);

ALTER TABLE public."Results"
  ADD CONSTRAINT "Results_pkey" PRIMARY KEY (attempt, cube_name, id, meeting_id, round);

ALTER TABLE public."Results"
  ADD CONSTRAINT "Results_time_ms_check" CHECK (time_ms > 0::numeric);

ALTER TABLE public."Results"
  ADD CONSTRAINT results_unique_attempt UNIQUE (meeting_id, id, cube_name, round, attempt);

GRANT ALL ON public."Results" TO anon;

GRANT ALL ON public."Results" TO authenticated;

GRANT ALL ON public."Results" TO service_role;

CREATE POLICY "Results allow all users select" ON public."Results"
  FOR SELECT
  USING (true);

CREATE TABLE public."Scrambles" (
  attempt    bigint NOT NULL,
  meeting_id bigint NOT NULL,
  round      bigint DEFAULT '1'::bigint NOT NULL,
  cube_name  text   NOT NULL,
  scramble   text   DEFAULT ''::text
);

COMMENT ON TABLE public."Scrambles" IS 'Scrambles for each attempt of a round in the meeting.';

ALTER TABLE public."Scrambles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Scrambles"
  ADD CONSTRAINT "Scrambles_scramble_key" UNIQUE (scramble);

ALTER TABLE public."Scrambles"
  ADD CONSTRAINT scrambles_holds_fkey FOREIGN KEY (meeting_id, cube_name) REFERENCES public."Holds"(meeting_id, cube_name) ON DELETE CASCADE;

ALTER TABLE public."Scrambles"
  ADD CONSTRAINT scrambles_pkey PRIMARY KEY (attempt, meeting_id, cube_name, round);

GRANT ALL ON public."Scrambles" TO anon;

GRANT ALL ON public."Scrambles" TO authenticated;

GRANT ALL ON public."Scrambles" TO service_role;

CREATE POLICY "Scramble allow all" ON public."Scrambles"
  USING (true)
  WITH CHECK (true);

CREATE TABLE public."StartedAttempts" (
  attempt    bigint  GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  cube_name  text    NOT NULL,
  id         bigint  NOT NULL,
  meeting_id bigint  NOT NULL,
  round      integer DEFAULT 1 NOT NULL
);

COMMENT ON TABLE public."StartedAttempts" IS 'The attempts that have been started';

COMMENT ON COLUMN public."StartedAttempts".round IS 'Round of competition';

ALTER TABLE public."StartedAttempts"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."StartedAttempts"
  ADD CONSTRAINT "StartedAttempts_cube_name_fkey" FOREIGN KEY (cube_name) REFERENCES public."Cubes"(cube_name) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."StartedAttempts"
  ADD CONSTRAINT "StartedAttempts_id_fkey" FOREIGN KEY (id) REFERENCES public."Members"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."StartedAttempts"
  ADD CONSTRAINT "StartedAttempts_meeting_id_fkey" FOREIGN KEY (meeting_id) REFERENCES public."Meetings"(meeting_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public."StartedAttempts"
  ADD CONSTRAINT "StartedAttempts_pkey" PRIMARY KEY (attempt, cube_name, id, meeting_id, round);

GRANT ALL ON public."StartedAttempts" TO anon;

GRANT ALL ON public."StartedAttempts" TO authenticated;

GRANT ALL ON public."StartedAttempts" TO service_role;

CREATE POLICY "Allow StartedAttempts" ON public."StartedAttempts"
  USING (true)
  WITH CHECK (true);
