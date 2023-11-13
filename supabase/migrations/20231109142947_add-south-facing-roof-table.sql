create table "public"."south_facing_houses" (
    "id" uuid not null default gen_random_uuid(),
    "roof_details" json,
    "address" text,
    "lat_lon" jsonb
);


CREATE UNIQUE INDEX south_facing_houses_lat_lon_key ON public.south_facing_houses USING btree (lat_lon);

CREATE UNIQUE INDEX south_facing_houses_pkey ON public.south_facing_houses USING btree (id);

alter table "public"."south_facing_houses" add constraint "south_facing_houses_pkey" PRIMARY KEY using index "south_facing_houses_pkey";

alter table "public"."south_facing_houses" add constraint "south_facing_houses_lat_lon_key" UNIQUE using index "south_facing_houses_lat_lon_key";


