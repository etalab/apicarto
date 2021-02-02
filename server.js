require('dotenv').config();

var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var cors = require('cors');
var onFinished = require('on-finished');
var cadastre = require('./controllers/cadastre');

var app = express();
var port = process.env.PORT || 8091;

app.use(bodyParser.json());
app.use(cors());

var env = process.env.NODE_ENV;

if (env === 'production') {
    app.enable('trust proxy');
}

app.use(require('./lib/request-logger')());

/* Routes */
app.use('/cadastre', cadastre({
    key: process.env.GEOPORTAIL_KEY || process.env.npm_package_config_geoportailKey,
    referer: process.env.GEOPORTAIL_REFERER || process.env.npm_package_config_geoportailReferer || 'http://localhost'
}));

/* Ready! */
app.listen(port);

module.exports = app;
