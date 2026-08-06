DROP function member_results(member_id integer);
CREATE OR REPLACE function member_results(member_id integer)
returns table (
  id integer,
  name text,
  faculty_full_name text,
  faculty_icon_link text,
  cube_name text,
  icon_link text,
  single_time_ms integer,
  single_rank integer,
  single_meeting_id integer,
  single_meeting_name text,
  avg_time_ms integer,
  avg_rank integer,
  avg_meeting_id integer,
  avg_meeting_name text
)
LANGUAGE sql
as $$
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
ORDER BY s.cube_name, s.single_rank;
$$




DROP function all_member_records();
CREATE function all_member_records()
returns table (
  id integer,
  name text,
  faculty_full_name text,
  faculty_icon_link text,
  cube_name text,
  icon_link text,
  single_time_ms integer,
  single_rank integer,
  single_meeting_id integer,
  single_meeting_name text,
  avg_time_ms integer,
  avg_rank integer,
  avg_meeting_id integer,
  avg_meeting_name text
)
LANGUAGE sql
as $$
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
ORDER BY s.cube_name, s.single_rank;

$$

-- Automatically approve all pending results for a meeting when the meeting is closed
-- Requires admin, president, or treasurer role to execute
create or replace function public.approve_pending_results(
  p_meeting_id integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
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

  if not exists (
    select 1
    from public."Meetings"
    where meeting_id = p_meeting_id
      and status = 'closed'
  ) then
    raise exception 'Meeting must be closed before approving results';
  end if;

  select count(*)
  into pending_count
  from public."PendingResults"
  where meeting_id = p_meeting_id;

  if pending_count = 0 then
    raise exception 'No pending results found for this meeting';
  end if;

  insert into public."Results" (
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
  from public."PendingResults"
  where meeting_id = p_meeting_id;

  get diagnostics inserted_count = row_count;

  if inserted_count <> pending_count then
    raise exception
      'Expected % inserts, received %',
      pending_count,
      inserted_count;
  end if;

  delete from public."PendingResults"
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
$$;

revoke execute
on function public.approve_pending_results(integer)
from public, anon;

grant execute
on function public.approve_pending_results(integer)
to authenticated;