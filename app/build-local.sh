#!/bin/bash

# Move into the app directory and create a new dist directory
rm -rf dist && mkdir dist
rm -rf build && mkdir build

# Run React build scripts
yarn build

# Run Electron dist scripts
yarn dist

# Build application
build --publish never
