create table "public"."existing-solar-properties" (
    "id" uuid not null default gen_random_uuid(),
    "address" json,
    "potential_savings_with_battery_gbp" double precision,
    "solar_array_info" json,
    "audit_flags" jsonb[],
    "google_earth_url" text,
    "screenshot_url" text
);


CREATE UNIQUE INDEX "existing-solar-properties_pkey" ON public."existing-solar-properties" USING btree (id);

alter table "public"."existing-solar-properties" add constraint "existing-solar-properties_pkey" PRIMARY KEY using index "existing-solar-properties_pkey";


