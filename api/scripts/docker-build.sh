#!/bin/bash

# Build the Docker image
docker build -t winds-api .

# List all Docker images
docker images

# Run the Docker image
docker run -p 8080:8080 -d winds-api
