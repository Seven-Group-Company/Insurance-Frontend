FROM node:alpine

WORKDIR /app/sgc_project

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 9000

CMD [ "npm", "run", "start" ]