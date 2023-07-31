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

