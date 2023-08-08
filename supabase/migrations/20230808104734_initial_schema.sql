create table "public"."quotes" (
    "installerId" bigint generated by default as identity not null,
    "dealId" bigint not null,
    "dateOfCompletion" timestamp with time zone,
    "currTime" timestamp with time zone,
    "quoteValue" double precision
);


alter table "public"."quotes" enable row level security;

CREATE UNIQUE INDEX quotes_pkey ON public.quotes USING btree ("installerId", "dealId");

alter table "public"."quotes" add constraint "quotes_pkey" PRIMARY KEY using index "quotes_pkey";


