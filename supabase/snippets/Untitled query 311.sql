
-- Required attempt format
insert into public."FormatAttempts" (
  format,
  max_attempts
)
values (
  'AO5',
  5
)
on conflict (format)
do update set max_attempts = excluded.max_attempts;


-- One test event
insert into public."Cubes" (
  cube_name,
  icon_link,
  "order",
  recommended_format
)
values (
  '3x3',
  '333.svg',
  1,
  'AO5'
)
on conflict (cube_name)
do update set
  icon_link = excluded.icon_link,
  "order" = excluded."order",
  recommended_format = excluded.recommended_format;


-- Local admin member
insert into public."Members" (
  id,
  email,
  name,
  membership,
  role,
  faculty,
  birthdate,
  wca_id,
  user_id
)
values (
  900001,
  'admin@test.local',
  'Local Test Admin',
  true,
  'admin',
  'Science',
  '2000-01-01',
  '',
  '2c67659e-96ac-481d-9471-53eea0d0d5b7'
)
on conflict (id)
do update set
  email = excluded.email,
  name = excluded.name,
  membership = excluded.membership,
  role = excluded.role,
  faculty = excluded.faculty,
  birthdate = excluded.birthdate,
  user_id = excluded.user_id;


-- Connect Auth metadata to member 900001.
-- The frontend's getUserRole() depends on member_id metadata.
update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'member_id', 900001,
    'full_name', 'Local Test Admin'
  )
where id = '2c67659e-96ac-481d-9471-53eea0d0d5b7';


-- Closed meeting required by approve_pending_results()
insert into public."Meetings" (
  meeting_id,
  date,
  passcode,
  description,
  meeting_name,
  tournament,
  status
)
values (
  900001,
  current_date,
  'local-test',
  'Disposable local approval test',
  'Local Approval Test',
  false,
  'closed'
)
on conflict (meeting_id)
do update set
  meeting_name = excluded.meeting_name,
  description = excluded.description,
  status = excluded.status;


-- Connect the 3x3 event to the meeting.
-- PendingResults has a foreign key to Holds.
insert into public."Holds" (
  meeting_id,
  cube_name,
  format,
  rounds
)
values (
  900001,
  '3x3',
  'AO5',
  1
)
on conflict (meeting_id, cube_name)
do update set
  format = excluded.format,
  rounds = excluded.rounds;


-- Five fake pending attempts
insert into public."PendingResults" (
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
values
  (
    1, 1, 900001, '3x3', 900001,
    1234, false, false, null, 1234
  ),
  (
    2, 1, 900001, '3x3', 900001,
    3678, false, false, '+2', 1678
  ),
  (
    3, 1, 900001, '3x3', 900001,
    2345, false, false, null, 2345
  ),
  (
    4, 1, 900001, '3x3', 900001,
    3456, false, false, null, 3456
  ),
  (
    5, 1, 900001, '3x3', 900001,
    4567, false, false, null, 4567
  )
on conflict (attempt, cube_name, id, meeting_id, round)
do update set
  time_ms = excluded.time_ms,
  record = excluded.record,
  average_record = excluded.average_record,
  penalty = excluded.penalty,
  raw_time_ms = excluded.raw_time_ms;