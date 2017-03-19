const https = require('https');
const url = require('url');

const express = require('express');
const bodyParser = require('body-parser');
//const WebSocket = require('ws');
const databox = require('node-databox');

const PORT = process.env.PORT || 8080;

const HTTPS_SERVER_CERT = process.env.HTTPS_SERVER_CERT || '';
const HTTPS_SERVER_PRIVATE_KEY = process.env.HTTPS_SERVER_PRIVATE_KEY || '';

const DATASOURCE_DS_light = JSON.parse(process.env.DATASOURCE_DS_light || '{}');
// TODO: https://github.com/me-box/node-databox/issues/12
const mobileStore = ((url) => url.protocol + '//' + url.host)(url.parse(DATASOURCE_DS_light.href));
const lightID = DATASOURCE_DS_light['item-metadata'].filter((pair) => pair.rel === 'urn:X-databox:rels:hasDatasourceid')[0].val;

const app = express();

const credentials = {
	key:  HTTPS_SERVER_PRIVATE_KEY,
	cert: HTTPS_SERVER_CERT,
};

const server = https.createServer(credentials, app);
//const wss = new WebSocket.Server({ server, path: '/ui/ws' });
var subscriptions;

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
	subscriptions.once('data', (hostname, datasourceID, data) => {
		res.json({ hostname, datasourceID, data });
	});
});

server.listen(PORT);

databox.waitForStoreStatus(mobileStore, 'active')
	.then(() => databox.subscriptions.connect(mobileStore))
	.then((subs) => {
		subscriptions = subs;
		/*
		subs.on('data', (hostname, datasourceID, data) => {
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN)
					client.send(data);
			});
		});
		*/
	})
	.then(() => databox.subscriptions.subscribe(mobileStore, lightID, 'ts'))
	.catch((err) => console.error(err));
