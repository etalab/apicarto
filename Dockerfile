FROM node:16-alpine

ENV PGHOST=db
ENV PGDATABASE=apicarto
ENV PGUSER=postgres
ENV PGPASSWORD=postgis
ENV PGPORT=5432

ARG http_proxy=""
ENV http_proxy=${http_proxy}
ENV HTTP_PROXY=${http_proxy}

ARG https_proxy=""
ENV https_proxy=${https_proxy}
ENV HTTPS_PROXY=${https_proxy}

ARG no_proxy=""
ENV no_proxy=${no_proxy}
ENV NO_PROXY=${no_proxy}

COPY --chown=node:node . /opt/apicarto

WORKDIR /opt/apicarto
USER node
RUN npm install

EXPOSE 8091
CMD ["node", "server.js"]

