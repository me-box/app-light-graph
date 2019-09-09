FROM amd64/alpine:3.8

WORKDIR /app

RUN addgroup -S databox && adduser -S -g databox databox && \
apk --no-cache add build-base pkgconfig nodejs npm git libzmq zeromq-dev libsodium-dev python  && \
npm install zeromq@4.6.0 --zmq-external --verbose && \
apk del build-base pkgconfig libsodium-dev python zeromq-dev


COPy ./package.json package.json
RUN npm install --production

COPY . .

LABEL databox.type="app"

EXPOSE 8080

USER databox
CMD ["npm","start"]
#CMD ["sleep","3000000"]
