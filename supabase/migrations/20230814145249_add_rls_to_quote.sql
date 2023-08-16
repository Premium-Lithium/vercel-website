create policy "allow insert for anon"
on "public"."quote"
as permissive
for insert
to anon
with check (true);


create policy "allow update for anon"
on "public"."quote"
as permissive
for update
to anon
using (true)
with check (true);



