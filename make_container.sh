#!/usr/bin/sh

echo "This will build app's ExpressJS docker image and run docker compose for production"
sleep 1
docker build -t product-sale .
docker-compose up