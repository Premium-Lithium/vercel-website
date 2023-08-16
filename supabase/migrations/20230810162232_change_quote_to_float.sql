alter table "public"."quote" alter column "totalQuote" drop default;

alter table "public"."quote" alter column "totalQuote" set data type double precision using "totalQuote"::double precision;


