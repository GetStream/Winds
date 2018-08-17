#!/bin/bash

# Create a fresh dist directory
rm -rf ../dist && mkdir ../dist

# Transpile src to JavaScript
npx babel ../src --out-dir ../dist

# Copy pm2 runtime file
cp ../process_prod.json ../dist/process_prod.json

# Copy build files to fresh /dist directory
cp ../package.json ../dist/package.json

# Install node modules via yarn
cd ../dist && yarn install --modules-folder node_modules
