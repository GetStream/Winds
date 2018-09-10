#!/bin/bash

# Remove the existing build directory and create a fresh one
rm -rf ../dist && mkdir ../dist

# Transpile ES6 to JavaScript
npx babel ../src --out-dir ../dist --ignore node_modules

# Copy build files to fresh /dist directory
cp ../src/package.json ../dist/package.json

# Copy build files to fresh /dist directory
cp process_prod.json ../dist/process_prod.json

# Copy email files to fresh /dist directory
cp -R ../src/utils/email/templates ../dist/utils/email

# Install node modules via yarn
cd ../dist && yarn install --production --modules-folder node_modules
