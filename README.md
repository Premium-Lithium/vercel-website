# Introduction
The Vercel project that holds all of Premium lithium's code, including api functions, webpages, and database schemas.

# Running
With the Nix package manager installed on your device

Get all dependencies of the project
```
nix develop
```

Install node package manager dependencies
```
pnpm install
```

Link vercel cli with vercel account
```
pnpx vercel link
```

Get the .env file on your local machine
```
pnpx vercel env pull .env
```

## Using local database
In a new terminal, outside of the Nix environment, but inside the project directory, you will need to set up a local Supabase database if you want to make changes to the schema or do any testing.
### Dependencies
You need docker, if on Ubuntu run the following
```
sudo snap install docker
```

Install the supabase package and save to dev dependencies
```
npm i supabase --save-dev
```

As we installed using npm, we will need to prefix any supabase command with `npx`, and likely also `sudo` depending on the permission setup on your system.
### Running Supabase locally
Initialise supabase if it hasn't been initialised in your branch
```
sudo npx supabase init
```

Login to Supabase CLI
```
sudo npx supabase login
```

Start the local Supabase instance
```
sudo npx supabase start
```

This may take a while as it needs to download the docker image.
### Manually interacting with the local DB
The local db can be access by visiting `http://localhost:54323/`

## Updating the DB schema
To copy the schema on production, we'll need to link the local instance with the remote
```
sudo npx supabase link --project-ref $PROJECT_ID
```
$PROJECT_ID can be found by going to `https://supabase.com/dashboard/projects`, clicking the project (pl-web), and then the url contains `https://supabase.com/dashboard/project/$PROJECT_ID`.

Copy the schema from the remote
```
sudo npx supabase db remote commit
```

Apply the local migrations
```
supabase db reset
```

You can now make changes to the local instance either through creating a new migration using `sudo npx supabase migration new $migration_name` and modifying the generated SQL script at `supabase/migrations/<timestamp>_$migration_name.sql`, or by modifying the local schema on the Supabase Studio, and running `sudo npx supabase db diff -f $migration_name`.

Push the DB schema to production **Should be implemented using GitHub actions once we've commited to Supabase**
```
supabase db push
```
---
## Deprecated 
---
## Using fake database

If you are making changes to the database, you should use a fake local database rather than the production database. In order to do this, first start the local fake postgres database:
```
scripts/start_test_database.sh
```

Then change the environment variables to point to the fake database rather than the real one. To do this, replace 'POSTGRES\_PRISMA\_URL' and 'POSTGRES\_URL\_NON\_POOLING' with the versions that are prefixed 'DEV\_'

The prisma client in sveltekit uses the environment variable 'POSTGRES\_URL', so this should also be changed to the 'DEV\_PRISMA\_URL'

### Manually interacting with the fake database
The fake database can be accessed with prisma studio using `pnpx prisma studio` or with the postgresql client using `psql postgresql://user:pass@localhost:5432/db`.
The psql client will prompt for a password, which is 'pass'

### Seeding the fake database
To put data into the fake database, first ensure the database is clean, by running
```
psql -h localhost -p 5432 -U user -d db -c 'drop schema public cascade;'
```

Then push the database schema from `schema.prisma` using
```
pnpx prisma db push
```

Then run the seed script to populate the database
```
pnpx prisma db seed
```

You can change the data that is seeded in the prisma/seed.js file.

## Backing Up the Database
to generate a local backup of the database, run the command:
```
pg_dump postgres://default:s7ogIvaKHLm6@ep-divine-union-019154-pooler.us-east-1.postgres.vercel-storage.com/verceldb > backup
```
Changing the name of 'backup' to whatever you want to name your backup file.

