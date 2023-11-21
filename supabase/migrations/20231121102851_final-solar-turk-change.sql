alter table "public"."south_facing_houses" alter column "address" set data type jsonb using "address"::jsonb;

CREATE UNIQUE INDEX south_facing_houses_address_key ON public.south_facing_houses USING btree (address);

alter table "public"."south_facing_houses" add constraint "south_facing_houses_address_key" UNIQUE using index "south_facing_houses_address_key";


