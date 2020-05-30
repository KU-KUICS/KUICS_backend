FROM node 

WORKDIR /kuics-backend
COPY package.json /kuics-backend
RUN npm install
COPY . /kuics-backend
CMD npm run start
EXPOSE 4000
