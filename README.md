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

## Using a local database - first time setup

You need docker on your machine
```
snap install docker
```

Docker may need root access
```
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

You may need to reboot for these changes to take effect
```
reboot
```

Login to Supabase CLI
```
supabase login
```

Start the local Supabase instance
```
supabase start
```
This may take a while as it needs to download the docker image.

## Using a local database - subsequent times
Start the local Supabase instance
```
supabase start
```
The local db can be accessed by visiting `http://localhost:54323/`

## Updating the DB schema

To change the production schema, we'll need to link the local instance with the remote
```
supabase link --project-ref $PROJECT_ID
```
$PROJECT_ID can be found by going to `https://supabase.com/dashboard/projects`, clicking the project (pl-web), and then the url contains `https://supabase.com/dashboard/project/$PROJECT_ID`.

Make a change to the local db via the Supabase Studio, and generate a new migration which will be the difference between production and local.
```
supabase db diff -f $migration_name
```

Check that the new migration works as intended on local
```
supabase db reset
```

Push the DB schema to production **Should be implemented using GitHub actions once we've commited to Supabase**
```
supabase db push
```

