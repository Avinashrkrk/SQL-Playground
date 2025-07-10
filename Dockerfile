FROM node:20

WORKDIR /SQL_Playground

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000:3000

CMD [ "npm", "run", "dev" ]