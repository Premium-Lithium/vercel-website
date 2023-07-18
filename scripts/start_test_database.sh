#!/bin/bash
podman run \
--name db \
-p 5432:5432 \
-d -e POSTGRES_USER=user \
-e POSTGRES_PASSWORD=pass \
-e POSTGRES_DB=db docker.io/library/postgres:14

