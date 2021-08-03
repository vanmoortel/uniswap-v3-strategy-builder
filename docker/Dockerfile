FROM node:16

RUN npm config set unsafe-perm true

RUN npm install pm2 -g

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "pm2-runtime", "start", "ecosystem.config.js","--env", "production" ]
