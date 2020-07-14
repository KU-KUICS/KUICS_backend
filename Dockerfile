FROM node:12

WORKDIR /kuics-backend

COPY package.json /kuics-backend
COPY yarn.lock /kuics-backend
RUN yarn install

ARG CACHEBUST=1
COPY . /kuics-backend
CMD yarn start

EXPOSE 4000
