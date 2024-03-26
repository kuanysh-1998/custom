### STAGE 1: Build ###
FROM node:18.16-alpine3.17 as build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY /src/assets/env.js /src/assets/env.template.js  ./
RUN npm install -g @angular/cli@17.2.0

RUN npm install
COPY . .
RUN ng build --configuration production
### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
WORKDIR /usr/share/nginx/html

RUN apk add -U tzdata
ENV TZ=Asia/Atyrau
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=build /usr/src/app/dist/client-app /usr/share/nginx/html
COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
