FROM node:alpine

WORKDIR "/app"

COPY ./package.json ./

RUN npm install

COPY . .

# ["npm", "run", "dev"] == start the development environment. ["npm", "run", "start"] == start the production environment
CMD ["npm", "run", "start"]


