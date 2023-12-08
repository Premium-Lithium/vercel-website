alter table "public"."campaign_customers" drop constraint "campaign_customers_pkey";

drop index if exists "public"."campaign_customers_pkey";

alter table "public"."campaign_customers" alter column "address" set not null;

CREATE UNIQUE INDEX campaign_customers_pkey ON public.campaign_customers USING btree (campaign_id, address);

alter table "public"."campaign_customers" add constraint "campaign_customers_pkey" PRIMARY KEY using index "campaign_customers_pkey";

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


