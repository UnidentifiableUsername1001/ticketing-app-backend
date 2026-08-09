FROM node:24-slim

WORKDIR /ticketing-app-server

COPY package.json package-lock.json ./

RUN npm ci

COPY  . .

EXPOSE 3000

CMD ["node", "app.js"]