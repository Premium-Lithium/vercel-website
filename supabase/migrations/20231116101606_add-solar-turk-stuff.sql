create table "public"."solar_turk_workers" (
    "assigned_projects" jsonb[],
    "worker_id" uuid not null
);


CREATE UNIQUE INDEX solar_turk_workers_pkey ON public.solar_turk_workers USING btree (worker_id);

CREATE UNIQUE INDEX solar_turk_workers_worker_id_key ON public.solar_turk_workers USING btree (worker_id);

alter table "public"."solar_turk_workers" add constraint "solar_turk_workers_pkey" PRIMARY KEY using index "solar_turk_workers_pkey";

alter table "public"."solar_turk_workers" add constraint "solar_turk_workers_worker_id_key" UNIQUE using index "solar_turk_workers_worker_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_random_south_facing_houses(num_rows integer)
 RETURNS SETOF south_facing_houses
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT *
        FROM south_facing_houses
        ORDER BY random()
        LIMIT num_rows;
END;
$function$
;


