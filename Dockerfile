FROM node:8-stretch

RUN apt update
RUN apt install -y postgresql-9.6
RUN apt install -y gdal-bin

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn --prod

# Bundle app source
COPY . .

EXPOSE 8091
CMD [ "yarn", "start" ]
