drop function if exists "public"."get_campaign_customers"(campaignids text[], numrows integer, assignedprojectids uuid[]);

create table "public"."campaign_customers_postcode_only" (
    "campaign_id" text,
    "customer_id" uuid,
    "address" jsonb,
    "address_formatted" text,
    "campaign_specific_data" jsonb,
    "audit_flags" integer[],
    "current_status" jsonb,
    "status_log" jsonb[],
    "analytics" jsonb
);


create table "public"."network_operator" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "operator_details" json,
    "code" text
);


create table "public"."platform_archive" (
    "person_id" uuid not null,
    "interaction_time" timestamp with time zone not null default now(),
    "id" uuid not null default gen_random_uuid(),
    "event_type" text not null,
    "template" text,
    "data" json
);


alter table "public"."campaign_customers" alter column "address" set not null;

alter table "public"."campaign_customers" add  column "lat_lon" jsonb;

alter table "public"."existing-solar-properties" alter column "address" set data type jsonb using "address"::jsonb;

alter table "public"."existing-solar-properties" alter column "audit_flags" set data type integer[] using "audit_flags"::integer[];

alter table "public"."platform_homeowners" add column "quote_immediately" boolean;

alter table "public"."platform_installers" alter column "customer_facing_profile" set data type jsonb using "customer_facing_profile"::jsonb;

alter table "public"."platform_installers" alter column "id" set default gen_random_uuid();

alter table "public"."platform_installers" alter column "mcs_certification" set data type text using "mcs_certification"::text;

alter table "public"."platform_jobs" add column "open_solar_project_id" bigint;

alter table "public"."platform_jobs" alter column "status" set default 'AWAITING_DESIGN'::text;

alter table "public"."platform_quotes" alter column "status" set default 'NOTSENT'::text;

CREATE UNIQUE INDEX "existing-solar-properties_id_key" ON public."existing-solar-properties" USING btree (id);

CREATE UNIQUE INDEX network_operator_pkey ON public.network_operator USING btree (id);

CREATE UNIQUE INDEX platform_archive_pkey ON public.platform_archive USING btree (id);

alter table "public"."network_operator" add constraint "network_operator_pkey" PRIMARY KEY using index "network_operator_pkey";

alter table "public"."platform_archive" add constraint "platform_archive_pkey" PRIMARY KEY using index "platform_archive_pkey";

alter table "public"."existing-solar-properties" add constraint "existing-solar-properties_id_key" UNIQUE using index "existing-solar-properties_id_key";

set check_function_bodies = off;

create or replace view "public"."battery_turk_worker_view" as  SELECT battery_turk_workers.worker_email,
    array_agg(jsonb_build_object('campaign_id', (project.project ->> 'campaign_id'::text), 'num_polygons', (project.project ->> 'num_polygons'::text), 'time_started', (project.project -> 'time_started'::text), 'time_finished', (project.project -> 'time_finished'::text))) AS completed_regions,
    battery_turk_workers.worker_id
   FROM battery_turk_workers,
    LATERAL unnest(battery_turk_workers.completed_regions) project(project)
  GROUP BY battery_turk_workers.worker_email, battery_turk_workers.completed_regions, battery_turk_workers.worker_id;


CREATE OR REPLACE FUNCTION public.get_campaign_customers(campaignids text[], assignedprojectids uuid[], numrows integer)
 RETURNS SETOF campaign_customers
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT *
    FROM campaign_customers
    WHERE campaign_id = ANY(campaignids)
    AND customer_id NOT IN (SELECT unnest(assignedprojectids))
    ORDER BY random()
    LIMIT numrows;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_rows(table_name text, num_rows integer)
 RETURNS SETOF record
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE format('SELECT * FROM %I ORDER BY random() LIMIT %s', table_name, num_rows);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_subset(table_name text, subset_size integer)
 RETURNS SETOF record
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY EXECUTE format('SELECT * FROM %I TABLESAMPLE BERNOULLI($1)', table_name) USING subset_size;
END;
$function$
;

create or replace view "public"."solar_turk_worker_view" as  SELECT solar_turk_workers.worker_email,
    solar_turk_workers.completed_projects,
    array_agg(jsonb_build_object('openSolarId', (project.project ->> 'openSolarId'::text), 'status', (project.project ->> 'status'::text), 'flags', (project.project -> 'flags'::text))) AS assigned_projects
   FROM solar_turk_workers,
    LATERAL unnest(solar_turk_workers.assigned_projects) project(project)
  GROUP BY solar_turk_workers.worker_email, solar_turk_workers.completed_projects;


create policy "allow read"
on "public"."south_facing_houses"
as permissive
for select
to public
using (true);


