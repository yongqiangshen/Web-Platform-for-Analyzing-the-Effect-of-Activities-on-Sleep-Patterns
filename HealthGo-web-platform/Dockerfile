FROM node:latest
MAINTAINER Wenjing Ling <wling8@gatech.edu>

ENV HTTP_PORT 8080

RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

COPY . /home/nodejs/app
RUN npm install --production

EXPOSE 8080

CMD ["node", "server.js"]