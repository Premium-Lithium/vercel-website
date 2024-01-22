alter table "public"."platform_homeowners" add column "date_signed_up" timestamp with time zone default now();

alter table "public"."platform_installers" add column "date_signed_up" timestamp with time zone default now();

alter table "public"."platform_jobs" add column "date_quotes_requested" timestamp with time zone;

alter table "public"."platform_quotes" add column "date_submitted" timestamp with time zone default now();


