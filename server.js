const https = require('https');
const url = require('url');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const databox = require('node-databox');

var credentials = databox.GetHttpsCredentials();

const PORT = process.env.PORT || 8080;
const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT;

const DATASOURCE_DS_light = process.env.DATASOURCE_DS_light ;

	let DS_light_Metadata = databox.HypercatToDataSourceMetadata(DATASOURCE_DS_light)
	let store_url = databox.GetStoreURLFromHypercat(DATASOURCE_DS_light)

	const app = express();

	const server = https.createServer(credentials, app);
	let subscription;

	// TODO: Check
	app.enable('trust proxy');
	app.disable('x-powered-by');

	//app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use('/ui', express.static('www'));
	app.set('views', './views');
	app.set('view engine', 'pug');

	app.get('/status', function(req, res){
		res.send('active');
	});

	app.get('/ui', function(req, res) {
		res.render('graph');
	});

	app.get('/ui/data', function(req, res) {
		subscription.once('data', (data) => {
			console.log("relay value", data)
			res.json(data.data);
		});
	});

	let sc = databox.NewStoreClient(store_url, DATABOX_ARBITER_ENDPOINT, false);

	sc.TSBlob.Observe(DS_light_Metadata.DataSourceID)
	.then((subs) => {
		console.log("observing " + DS_light_Metadata.DataSourceID)
		subscription = subs;
		subscription.on('error',(err)=>{
			console.warn(err);
		});

	})
	.catch((err) => console.error(err));

	console.log("Starting UI server .... ");
	server.listen(PORT);
