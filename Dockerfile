FROM node:12

WORKDIR /kuics-backend

COPY package.json /kuics-backend
RUN npm install

ARG CACHEBUST=1
COPY . /kuics-backend
CMD npm run start

EXPOSE 4000
