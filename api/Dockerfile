# Use the latest version of Node
FROM mhart/alpine-node:latest

# Update dependency cache
RUN apk update && apk upgrade

# install dependencies
RUN apk add --no-cache make gcc g++ python git

# Install PM2 globally
RUN yarn global add pm2

# Create app directory
WORKDIR /usr/src/api

# Copy package.json for build
COPY package.json ./

# Copy app source code
COPY . .

# Expose port 8080
EXPOSE 8080

# Run process via pm2
CMD ["pm2-runtime", "start", "process_prod.json"]
