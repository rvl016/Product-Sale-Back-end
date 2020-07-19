#!/usr/bin/sh

echo "Setting up postgres container..."
echo "PS: Make sure your localhost 5432 port is available!"
docker run -e POSTGRES_DB=test -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=express --publish 127.0.0.1:5432:5432 postgres:10 &>/dev/null &
sleep 5
npm test