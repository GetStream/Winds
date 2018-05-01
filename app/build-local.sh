#!/bin/bash

# Move into the app directory and create a new dist directory
rm -rf dist && mkdir dist
rm -rf build && mkdir build

# Run react build scripts
yarn build -mwl

# Build application
build --publish never
