create table "public"."campaign_audit_criteria" (
    "id" bigint generated by default as identity not null,
    "name" text,
    "description" text,
    "human_required" boolean
);


create table "public"."campaign_customers" (
    "campaign_id" text not null,
    "customer_id" uuid default gen_random_uuid(),
    "address" jsonb,
    "address_formatted" text,
    "campaign_specific_data" jsonb,
    "audit_flags" integer[],
    "current_status" jsonb,
    "status_log" jsonb[],
    "analytics" jsonb
);


create table "public"."campaign_master" (
    "campaign_id" text not null,
    "campaign_name" text,
    "start_date" date,
    "end_date" date,
    "area" text,
    "volume" integer,
    "unit_rate" real,
    "campaign_status" text default 'not_started'::text,
    "content_links" jsonb,
    "campaign_specific_schema" jsonb,
    "audit_criteria" integer[]
);


CREATE UNIQUE INDEX campaign_audit_criteria_pkey ON public.campaign_audit_criteria USING btree (id);

CREATE UNIQUE INDEX campaign_customers_pkey ON public.campaign_customers USING btree (campaign_id, address_formatted);

CREATE UNIQUE INDEX master_campaign_pkey ON public.campaign_master USING btree (campaign_id);

alter table "public"."campaign_audit_criteria" add constraint "campaign_audit_criteria_pkey" PRIMARY KEY using index "campaign_audit_criteria_pkey";

alter table "public"."campaign_customers" add constraint "campaign_customers_pkey" PRIMARY KEY using index "campaign_customers_pkey";

alter table "public"."campaign_master" add constraint "master_campaign_pkey" PRIMARY KEY using index "master_campaign_pkey";

alter table "public"."campaign_customers" add constraint "campaign_customers_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaign_master(campaign_id) not valid;

alter table "public"."campaign_customers" validate constraint "campaign_customers_campaign_id_fkey";


