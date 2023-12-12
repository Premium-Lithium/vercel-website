drop function if exists "public"."get_random_campaign_customers"(numrows integer, campaignid text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_campaign_customers(campaignids text[], numrows integer)
 RETURNS SETOF campaign_customers
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT *
        FROM campaign_customers
        WHERE campaign_id = ANY(campaignids)
        ORDER BY random()
        LIMIT numrows;
END;
$function$
;


