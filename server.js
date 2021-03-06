const https = require('https');
const url = require('url');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const databox = require('node-databox');

var credentials = databox.getHttpsCredentials();

const PORT = process.env.PORT || 8080;

const DATASOURCE_DS_light = process.env.DATASOURCE_DS_light ;

databox.HypercatToSourceDataMetadata(DATASOURCE_DS_light)
.then((data)=>{

	let DS_light_Metadata = data.DataSourceMetadata;
	let store_url = data.DataSourceURL;

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
			res.json(data);
		});
	});

	let tsc = databox.NewTimeSeriesBlobClient(store_url, false);

	tsc.Observe(DS_light_Metadata.DataSourceID)
	.then((subs) => {
		subscription = subs;
		subscription.on('error',(err)=>{
			console.warn(err);
		});

	})
	.catch((err) => console.error(err));

	console.log("Starting UI server .... ");
	server.listen(PORT);

})
.catch((err)=>{
	console.log("Error:: ", err);
});
