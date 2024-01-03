drop function if exists "public"."get_random_campaign_customers"(numrows integer, campaignid text);

set check_function_bodies = off;

create or replace function public.get_campaign_customers (
  campaignids text[],
  numrows integer,
  assignedprojectids uuid[]
) returns setof campaign_customers as $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM campaign_customers
    WHERE campaign_id = ANY(campaignids)
    AND customer_id NOT IN (SELECT unnest(assignedprojectids))
    ORDER BY random()
    LIMIT numrows;
END;
$$ language plpgsql;


