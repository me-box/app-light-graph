require! [ express, request ]

const ARBITER_TOKEN = process.env.ARBITER_TOKEN
const PORT = process.env.PORT or 8080

unless ARBITER_TOKEN?
  throw new Error 'Arbiter token undefined'

macaroon <-! get-macaroon = (callback) !->
  err, res, macaroon <-! request.post do
    url: "http://arbiter:8080/macaroon"
    form:
      token: ARBITER_TOKEN
      target: \databox-driver-mobile.store
  if err? then throw err
  callback macaroon

express!

  ..set \views \www
  ..set 'view engine' \pug

  ..use (req, res, next) !->
    res.header 'Access-Control-Allow-Origin' \*
    next!

  ..get \/status (req, res) !-> res.send \active

  ..get \/ (req, res) !-> res.render \graph

  ..get \/light (req, res) !->
    request.post do
      url: 'http://databox-driver-mobile.store:8080/api/light'
      form: { macaroon }
    .pipe res

  ..listen PORT
