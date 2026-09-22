-- Exécuter dans Supabase > SQL Editor. Quota par compte : 10/jour et 1/minute.
create table if not exists public.ai_usage (
 user_id uuid primary key references auth.users(id) on delete cascade,
 usage_day date not null default (now() at time zone 'utc')::date,
 daily_count integer not null default 0,
 last_request timestamptz
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;
create or replace function public.consume_ai_quota()
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare affected integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.ai_usage(user_id,usage_day,daily_count,last_request)
 values(auth.uid(),(now() at time zone 'utc')::date,1,now())
 on conflict (user_id) do update set
  usage_day=(now() at time zone 'utc')::date,
  daily_count=case when public.ai_usage.usage_day=(now() at time zone 'utc')::date then public.ai_usage.daily_count+1 else 1 end,
  last_request=now()
 where (public.ai_usage.usage_day<>(now() at time zone 'utc')::date or public.ai_usage.daily_count<10)
   and (public.ai_usage.last_request is null or public.ai_usage.last_request<=now()-interval '1 minute');
 get diagnostics affected = row_count;
 return affected > 0;
end;
$$;
revoke all on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;
