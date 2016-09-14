FROM node:argon
#FROM iron/node

ADD package.json package.json
RUN npm install
ADD . .

LABEL databox.type="app"

EXPOSE 8080

CMD ["npm","start"]
