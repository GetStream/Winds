#!/bin/bash

# stop all containers
docker stop --force $(docker ps -a -q)

# destroy all containers
docker rm --force $(docker ps -a -q)

# destroy all images
docker rmi --force $(docker images -q)
