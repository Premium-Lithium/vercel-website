create table "public"."battery_turk_workers" (
    "worker_id" uuid not null,
    "completed_regions" jsonb,
    "assigned_region" jsonb[]
);

alter table "public"."campaign_master" alter column "area" set data type jsonb[] using "area"::jsonb[];

CREATE UNIQUE INDEX battery_turk_workers_pkey ON public.battery_turk_workers USING btree (worker_id);

alter table "public"."battery_turk_workers" add constraint "battery_turk_workers_pkey" PRIMARY KEY using index "battery_turk_workers_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_random_campaign_customers(numrows integer, campaignid text)
 RETURNS SETOF campaign_customers
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT *
        FROM campaign_customers
        WHERE campaign_id = campaignid
        ORDER BY random()
        LIMIT numrows;
END;
$function$
;


