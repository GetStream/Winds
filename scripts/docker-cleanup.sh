#!/bin/bash

# stop all containers
docker stop $(docker ps -a -q)

# destroy all containers
docker rm $(docker ps -a -q)

# destroy all images
docker rmi $(docker images -q)
