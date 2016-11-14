# Start always from Node 6.9 LTS
FROM node:boron

# Create the app user and home directory
ENV APP_CONTENT /home/app
RUN groupadd app && useradd --create-home --home-dir "$APP_CONTENT" -g app app \
    && rm -Rf "$APP_CONTENT" \
    && mkdir -p "$APP_CONTENT" \
    && chown -R app:app "$APP_CONTENT"
WORKDIR $APP_CONTENT

# install always the latest available MongoDB 3.2 and Git client
ENV DB_CONTENT /var/lib/mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 \
  && echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list \
  && apt-get update \
  && apt-get install -y git mongodb-org

# add MongoDB init script
ADD https://raw.githubusercontent.com/mongodb/mongo/master/debian/init.d /etc/init.d/mongod
RUN chmod +x /etc/init.d/mongod

# install global dependencies
RUN npm install -g sails pm2

# grab gosu for easy step-down from root
ENV GOSU_VERSION 1.10
RUN set -x \
    && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
    && dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch" \
    && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc" \
    && export GNUPGHOME="$(mktemp -d)" \
    && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    && rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

VOLUME [ "$APP_CONTENT", "$DB_CONTENT" ]

EXPOSE 3000
CMD ["pm2-docker", "process.json"]