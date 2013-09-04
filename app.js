var express = require('express');
var lessMiddleware = require('less-middleware');
var config = require('./config/config');

var app = express();

app.use(lessMiddleware({ src: __dirname + "/public", compress : true }));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());

app.get('/', function(req, res) {
	res.render('index.jade', {});
});

app.listen(config.server.port);

exports.app = app;