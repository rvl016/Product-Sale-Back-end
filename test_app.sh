#!/usr/bin/sh

echo "Setting up postgres container..."
echo "PS: Make sure your localhost 5432 port is available!"
container_id=$(docker run -e POSTGRES_DB=test -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=express --publish 127.0.0.1:5432:5432 --detach postgres:10)
sleep 5
npm test
docker rm --force $container_id