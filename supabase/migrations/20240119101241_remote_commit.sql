alter table "public"."campaign_customers" drop column "lat_lon";

alter table "public"."platform_homeowners" drop column "allow_texts";

alter table "public"."platform_homeowners" drop column "email_confirmed";

alter table "public"."platform_homeowners" drop column "sms_confirmed";

alter table "public"."platform_homeowners" add column "contact_preferences" text;

alter table "public"."platform_homeowners" add column "email_verify_code" text;

alter table "public"."platform_homeowners" add column "interests" text[];

alter table "public"."platform_homeowners" add column "lat_lon" jsonb;

alter table "public"."platform_homeowners" add column "phone_verify_code" text;

alter table "public"."platform_homeowners" add column "postcode" text;

alter table "public"."platform_homeowners" alter column "quote_immediately" set default false;

alter table "public"."platform_homeowners" alter column "quote_immediately" set not null;

alter table "public"."platform_installers" drop column "allow_texts";

alter table "public"."platform_installers" add column "email_verify_code" text;

alter table "public"."platform_installers" add column "first_name" text;

alter table "public"."platform_installers" add column "last_name" text;

alter table "public"."platform_installers" add column "phone_verify_code" text;

alter table "public"."platform_installers" add column "postcode" text;

alter table "public"."platform_installers" alter column "mcs_certification" set data type jsonb using "mcs_certification"::jsonb;


