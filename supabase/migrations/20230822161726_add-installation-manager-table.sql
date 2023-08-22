drop policy "Enable update for users based on email" on "public"."user_data";

alter table "public"."user_data" drop constraint "user_data_id_fkey";

alter table "public"."installers" drop constraint "installers_pkey";

alter table "public"."jobs" drop constraint "jobs_pkey";

alter table "public"."user_data" drop constraint "user_data_pkey";

drop index if exists "public"."installers_pkey";

drop index if exists "public"."jobs_pkey";

drop index if exists "public"."user_data_pkey";

drop table "public"."installers";

drop table "public"."jobs";

drop table "public"."user_data";

create table "public"."installation-manager-regions" (
    "id" bigint not null,
    "name" text,
    "latlong" text
);


alter table "public"."installation-manager-regions" enable row level security;

CREATE UNIQUE INDEX "installation-manager-regions_id_key" ON public."installation-manager-regions" USING btree (id);

CREATE UNIQUE INDEX "installation-manager-regions_pkey" ON public."installation-manager-regions" USING btree (id);

alter table "public"."installation-manager-regions" add constraint "installation-manager-regions_pkey" PRIMARY KEY using index "installation-manager-regions_pkey";

alter table "public"."installation-manager-regions" add constraint "installation-manager-regions_id_key" UNIQUE using index "installation-manager-regions_id_key";

create policy "allow insert for anon"
on "public"."installation-manager-regions"
as permissive
for insert
to anon
with check (true);


create policy "allow select for anon"
on "public"."installation-manager-regions"
as permissive
for select
to anon
using (true);


create policy "allow update for anon"
on "public"."installation-manager-regions"
as permissive
for update
to anon
using (true)
with check (true);



