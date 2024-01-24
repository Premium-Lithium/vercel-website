alter table "public"."platform_installers" add column "completed_jobs" integer not null default 0;

alter table "public"."platform_installers" add column "lat_lon" jsonb;

create policy "anon_select"
on "public"."platform_homeowners"
as permissive
for select
to anon
using (true);



