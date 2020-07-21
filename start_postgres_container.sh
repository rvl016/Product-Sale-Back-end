#!/usr/bin/sh

docker run -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=express --publish 127.0.0.1:5432:5432 --detach postgres:10
