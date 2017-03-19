const express = require('express');
const request = require('request');

const ARBITER_TOKEN = process.env.ARBITER_TOKEN;
const PORT = process.env.PORT || 8080;

if (ARBITER_TOKEN == null)
	throw new Error('Arbiter token undefined');

(getMacaroon = function(callback) {
	request.post({
		url: "http://arbiter:8080/macaroon",
		form: {
			token: ARBITER_TOKEN,
			target: 'databox-driver-mobile.store'
		}
	}, function(err, res, macaroon) {
		if (err != null)
			throw err;
		callback(macaroon);
	});
})(function(macaroon) {
	var app = express();

	app.set('views', 'www');
	app.set('view engine', 'pug');

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		next();
	});

	app.get('/status', function(req, res) {
		res.send('active');
	});

	app.get('/', function(req, res) {
		res.render('graph');
	});

	app.get('/light', function(req, res) {
		request.post({
			url: 'http://databox-driver-mobile.store:8080/api/light',
			form: {
				macaroon: macaroon
			}
		}).pipe(res);
	});

	app.listen(PORT);
});
