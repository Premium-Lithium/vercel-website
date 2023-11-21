alter table "public"."solar_turk_workers" add column "completed_projects" integer default 0;

alter table "public"."south_facing_houses" add column "open_solar_projects" jsonb[];


