alter table "public"."battery_turk_workers" alter column "completed_regions" set data type jsonb[] using "completed_regions"::jsonb[];


