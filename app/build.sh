#!/bin/bash

# Remove the existing build directory and create a fresh one
rm -rf api/dist && mkdir api/dist

# Transpile ES6 to JavaScript
npx babel api/src --out-dir api/dist --ignore node_modules

# Copy build files to fresh /dist directory
cp api/src/package.json api/dist/package.json

# Copy build files to fresh /dist directory
cp api/src/workers/package.json api/dist/workers/package.json

# Copy build files to fresh /dist directory
cp process_prod.json api/dist/process_prod.json

# Copy email files to fresh /dist directory
cp -R api/src/utils/email/templates api/dist/utils/email

# Install node modules via yarn
cd api/dist && yarn install --production --modules-folder node_modules

echo "Build complete! Now run the following command to start the process: pm2 start process_prod.json"
