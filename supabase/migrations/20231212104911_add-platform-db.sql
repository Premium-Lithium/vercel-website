create table "public"."platform_homeowners" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "address" text,
    "email" text,
    "allow_texts" boolean default false,
    "phone_number" text,
    "email_confirmed" boolean default false,
    "sms_confirmed" boolean default false
);


create table "public"."platform_installers" (
    "id" uuid not null,
    "address" text,
    "email_address" text,
    "phone_number" text,
    "allow_texts" boolean default false,
    "company_name" text,
    "company_registration" text,
    "mcs_certification" boolean,
    "certification_expiry" date,
    "liability_insurance_certificate" text,
    "insurance_expiry" date,
    "customer_facing_profile" text,
    "pre_filled_bid" integer
);


create table "public"."platform_jobs" (
    "homeowner_id" uuid,
    "energiser_configuration" jsonb,
    "system_type" text[],
    "num_desired_quotes" integer default 3,
    "update_timescale" integer,
    "status" text default 'PENDING_QUOTES'::text,
    "id" uuid not null default gen_random_uuid()
);


create table "public"."platform_quotes" (
    "installer_id" uuid not null,
    "job_price" real,
    "planned_start_date" date,
    "estimated_duration" integer,
    "estimated_days_on_site" integer,
    "status" text default 'UNACCEPTED'::text,
    "job_id" uuid not null
);

CREATE UNIQUE INDEX platform_homeowners_pkey ON public.platform_homeowners USING btree (id);

CREATE UNIQUE INDEX platform_installers_pkey ON public.platform_installers USING btree (id);

CREATE UNIQUE INDEX platform_jobs_pkey ON public.platform_jobs USING btree (id);

CREATE UNIQUE INDEX platform_quotes_pkey ON public.platform_quotes USING btree (job_id, installer_id);

alter table "public"."platform_homeowners" add constraint "platform_homeowners_pkey" PRIMARY KEY using index "platform_homeowners_pkey";

alter table "public"."platform_installers" add constraint "platform_installers_pkey" PRIMARY KEY using index "platform_installers_pkey";

alter table "public"."platform_jobs" add constraint "platform_jobs_pkey" PRIMARY KEY using index "platform_jobs_pkey";

alter table "public"."platform_quotes" add constraint "platform_quotes_pkey" PRIMARY KEY using index "platform_quotes_pkey";

alter table "public"."platform_jobs" add constraint "platform_jobs_homeowner_id_fkey" FOREIGN KEY (homeowner_id) REFERENCES platform_homeowners(id) not valid;

alter table "public"."platform_jobs" validate constraint "platform_jobs_homeowner_id_fkey";

alter table "public"."platform_quotes" add constraint "platform_quotes_installer_id_fkey" FOREIGN KEY (installer_id) REFERENCES platform_installers(id) not valid;

alter table "public"."platform_quotes" validate constraint "platform_quotes_installer_id_fkey";

alter table "public"."platform_quotes" add constraint "platform_quotes_job_id_fkey" FOREIGN KEY (job_id) REFERENCES platform_jobs(id) not valid;

alter table "public"."platform_quotes" validate constraint "platform_quotes_job_id_fkey";


