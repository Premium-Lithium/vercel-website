alter table "public"."solar_turk_workers" enable row level security;

alter table "public"."south_facing_houses" enable row level security;

create policy "Allow insert for authenticated users only"
on "public"."solar_turk_workers"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow workers to update their own entries"
on "public"."solar_turk_workers"
as permissive
for update
to authenticated
using ((auth.uid() = worker_id));


create policy "Allow workers to view their own entry"
on "public"."solar_turk_workers"
as permissive
for select
to authenticated
using ((auth.uid() = worker_id));


create policy "Allow insert for authenticated users"
on "public"."south_facing_houses"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow select for authenticated users"
on "public"."south_facing_houses"
as permissive
for select
to authenticated
using (true);


create policy "Allow update for authenticated users"
on "public"."south_facing_houses"
as permissive
for update
to authenticated
using (true);



