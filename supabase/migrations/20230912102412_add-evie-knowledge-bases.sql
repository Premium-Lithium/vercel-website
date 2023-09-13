create sequence "public"."evie_general_knowledge_base_id_seq";

create sequence "public"."evie_pricing_knowledge_base_id_seq";

alter table "public"."documents" drop constraint "documents_pkey";

drop index if exists "public"."documents_pkey";

drop table "public"."documents";

create table "public"."evie_general_knowledge_base" (
    "id" bigint not null default nextval('evie_general_knowledge_base_id_seq'::regclass),
    "content" text,
    "metadata" jsonb,
    "embedding" vector(1536)
);


create table "public"."evie_pricing_knowledge_base" (
    "id" bigint not null default nextval('evie_pricing_knowledge_base_id_seq'::regclass),
    "content" text,
    "metadata" jsonb,
    "embedding" vector(1536)
);


alter sequence "public"."evie_general_knowledge_base_id_seq" owned by "public"."evie_general_knowledge_base"."id";

alter sequence "public"."evie_pricing_knowledge_base_id_seq" owned by "public"."evie_pricing_knowledge_base"."id";

drop sequence if exists "public"."documents_id_seq";

CREATE UNIQUE INDEX evie_general_knowledge_base_pkey ON public.evie_general_knowledge_base USING btree (id);

CREATE UNIQUE INDEX evie_pricing_knowledge_base_pkey ON public.evie_pricing_knowledge_base USING btree (id);

alter table "public"."evie_general_knowledge_base" add constraint "evie_general_knowledge_base_pkey" PRIMARY KEY using index "evie_general_knowledge_base_pkey";

alter table "public"."evie_pricing_knowledge_base" add constraint "evie_pricing_knowledge_base_pkey" PRIMARY KEY using index "evie_pricing_knowledge_base_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.match_documents_general(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM evie_general_knowledge_base
  WHERE metadata @> filter
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_documents_pricing(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM evie_pricing_knowledge_base
  WHERE metadata @> filter
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;


