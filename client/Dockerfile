FROM node:alpine as builder
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
# set up the actual build step so that builds the prduction versions of our front end assets
RUN npm run build


# copy over nginx.default.conf file
FRON nginx
# change the port number that the nginx on client listens on
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# copy all of the build assets from the builder phase (we specified /app/build because we set WORKDIR as '/app') 
COPY --from=builder /app/build /usr/share/nginx/html
