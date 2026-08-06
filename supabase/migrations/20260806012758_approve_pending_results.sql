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