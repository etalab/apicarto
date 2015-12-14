var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var cors = require('cors');
var pg = require('pg');
var morgan = require('morgan');
var onFinished = require('on-finished');
var communesHelper = require('./helpers/communes');
var aoc = require('./controllers/aoc');
var codesPostaux = require('./controllers/codes-postaux');
var qp = require('./controllers/quartiers-prioritaires');
var cadastre = require('./controllers/cadastre');

var app = express();
var port = process.env.PORT || 8091;

app.use(bodyParser.json());
app.use(cors());

var env = process.env.NODE_ENV;

if (env === 'production') {
    app.use(morgan(':date[clf] :req[x-real-ip] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));
}

if (env === 'development') {
    app.use(morgan('dev'));
}

/* Middlewares */
function pgClient(req, res, next) {
    pg.connect(process.env.PG_URI || 'postgres://localhost/apicarto', function (err, client, done) {
        if (err) return next(err);
        req.pgClient = client;
        req.pgEnd = _.once(done);
        onFinished(res, req.pgEnd);
        next();
    });
}

/* Routes */
app.post('/aoc/api/beta/aoc/in', pgClient, communesHelper.intersects({ ref: 'ign-parcellaire' }), aoc.in);
app.get('/codes-postaux/communes/:codePostal', codesPostaux.communes);
app.post('/quartiers-prioritaires/search', pgClient, qp.search);
app.use('/cadastre', cadastre({
    key: process.env.GEOPORTAIL_KEY || process.env.npm_package_config_geoportailKey,
    referer: process.env.GEOPORTAIL_REFERER || process.env.npm_package_config_geoportailReferer || 'http://localhost'
}));

/* Ready! */
app.listen(port, function () {
    console.log('Start listening on port %d', port);
});

module.exports = app;
