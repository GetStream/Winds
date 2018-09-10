#!/bin/bash

# Remove the existing build directory and create a fresh one
rm -rf api/dist && mkdir -p api/dist/{utils,email/templates}

# Transpile ES6 to JavaScript
npx babel api/src --out-dir api/dist --ignore node_modules

# Copy build files to fresh /dist directory
cp api/package.json api/dist/package.json

# Copy email files to fresh /dist directory
cp -R api/src/utils/email/templates api/dist/utils/email

# Install node modules via yarn
cd api/dist && yarn install --production --modules-folder node_modules
