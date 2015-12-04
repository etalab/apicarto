FROM node:4-wheezy
# replace this with your application's default port

EXPOSE 8091

COPY package.json /src/package.json
RUN cd /src; npm install
COPY . /src
CMD ["npm", "start"]
