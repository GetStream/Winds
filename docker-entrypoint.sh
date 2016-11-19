#!/bin/bash
set -e

if [[ "$*" == pm2-docker*process.json* ]]; then
  # Fix permissions before starting
  gosu root chown -R mongodb:mongodb "$DB_CONTENT"

  # Start MongoDB database
  gosu root service mongod start

  # install the latest Git status of the application
  if ! [ "$(ls -A $APP_CONTENT)" ]; then
    gosu root git clone https://github.com/GetStream/Winds.git "$APP_CONTENT"
  fi

  # fix permissions, create empty .env file and bind to port 3000
  gosu root chown -R app:app "$APP_CONTENT" \
    && touch "$APP_CONTENT/.env" \
    && sed -i 's/"PORT": 80,/"PORT": 3000,/g' process.json

  # Install production dependencies
  npm install --production

  # If data has not been initialized, do it
  if [ ! -f "$APP_CONTENT/.initial_data_loaded" ]; then
    gosu app node "$APP_CONTENT/load_initial_data.js" \
      && touch "$APP_CONTENT/.initial_data_loaded"
  fi

  # Run the application as app user
  set -- gosu app "$@"
fi

exec "$@"