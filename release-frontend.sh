#!/bin/bash

# exit on first error
set -o errexit

# output each command
set -x

# Bump application version
cd app/ && bump --patch && cd ../

# Prompt user to bump tag and push all files to github
bump --prompt --tag --push --all

# Move into the app directory and create a new dist directory
cd app && rm -rf dist && mkdir dist

# Get bumped package.json version and assign to variable for later use
VERSION=$(cat package.json | grep version | head -1 | awk -F= "{ print $2 }" | sed 's/[version:,\",]//g' | tr -d '[[:space:]]')

# Run React build scripts
yarn build

# Run Electron build scripts
yarn dist

# Build application
build --c.extraMetadata.main=build/electron.js -p always

# Deploy Linux version to Snap
snapcraft push --release stable dist/winds_${VERSION}_amd64.snap

# Interpolate newly built version in latest.html
sed -e "s/\${version}/$VERSION/" ../latest.html.tpl > latest.html

# Upload latest.html to S3 bucket
aws s3 cp latest.html s3://winds-2.0-releases/latest.html --acl=public-read && rm latest.html
