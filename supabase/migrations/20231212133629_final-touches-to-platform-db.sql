alter table "public"."platform_installers" add column "installation_preferences" jsonb;

alter table "public"."platform_jobs" add column "bids" jsonb[];


