create table "public"."platform_academies" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "email" text,
    "phone_number" text,
    "completed_jobs" jsonb[] default '{}'::jsonb[]
);


alter table "public"."platform_academies" enable row level security;

alter table "public"."platform_installers" add column "academy_id" uuid;

CREATE UNIQUE INDEX platform_academies_pkey ON public.platform_academies USING btree (id);

alter table "public"."platform_academies" add constraint "platform_academies_pkey" PRIMARY KEY using index "platform_academies_pkey";

alter table "public"."platform_installers" add constraint "platform_installers_academy_id_fkey" FOREIGN KEY (academy_id) REFERENCES platform_academies(id) not valid;

alter table "public"."platform_installers" validate constraint "platform_installers_academy_id_fkey";


