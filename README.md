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

