var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var cors = require('cors');
var pg = require('pg');
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

/* Static files (doc) */
app.use('/apidoc',  express.static(__dirname + '/doc'));
app.use(
    '/apidoc/vendor/swagger-ui',
    express.static(__dirname + '/node_modules/swagger-ui/dist')
);

var env = process.env.NODE_ENV;

if (env === 'production') {
    app.enable('trust proxy');
}

app.use(require('./lib/request-logger')());

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
app.get('/quartiers-prioritaires/layer', pgClient, qp.layer);
app.use('/cadastre', cadastre({
    key: process.env.GEOPORTAIL_KEY || process.env.npm_package_config_geoportailKey,
    referer: process.env.GEOPORTAIL_REFERER || process.env.npm_package_config_geoportailReferer || 'http://localhost'
}));

/* Ready! */
app.listen(port);

module.exports = app;
