create table "public"."user_data" (
    "id" uuid not null,
    "data" text default 'no info'::text
);
alter table "public"."user_data" enable row level security;
CREATE UNIQUE INDEX user_data_pkey ON public.user_data USING btree (id);
alter table "public"."user_data" add constraint "user_data_pkey" PRIMARY KEY using index "user_data_pkey";
alter table "public"."user_data" add constraint "user_data_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."user_data" validate constraint "user_data_id_fkey";
create policy "Enable update for users based on email"
on "public"."user_data"
as permissive
for all
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));
