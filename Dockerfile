FROM node:12

WORKDIR /kuics-backend

COPY package.json /kuics-backend
RUN npm install

COPY . /kuics-backend
CMD git pull origin master && npm run start

EXPOSE 4000
