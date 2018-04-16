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
var zoneppr= require ('./controllers/ppr.js');
var app = express();
var gpu = require('./controllers/gpu');
var port = process.env.PORT || 8091;

app.use(bodyParser.json());
app.use(cors());

app.use(function(req,res,next) {
    console.log(req.method, ' ', req.path,' ', JSON.stringify(req.query));
    next();
});


app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

/*------------------------------------------------------------------------------
 * /api/doc - exposition de la documentation
 -----------------------------------------------------------------------------*/
app.use('/api/doc',  express.static(__dirname + '/doc'));
app.use(
    '/api/doc/vendor/swagger-ui',
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
/*


/* -----------------------------------------------------------------------------
 * Routes
 -----------------------------------------------------------------------------*/

 /* Module cadastre */
 app.use('/api/cadastre',cadastre);

/* Module AOC */
app.post('/aoc/api/beta/aoc/in', pgClient, communesHelper.intersects({ ref: 'ign-parcellaire' }), aoc.in);

/* Module code postaux */
app.get('/api/codes-postaux/communes/:codePostal', codesPostaux.communes);

/* Module quartiers prioritaires */
app.get('/api/quartiers-prioritaires/layer', pgClient, qp.layer);
app.post('/api/quartiers-prioritaires/search', pgClient, qp.search);

/* Module risque (ppr) */
app.post('/api/ppr/in',pgClient,zoneppr.in);
app.get('/api/ppr/secteur', pgClient, zoneppr.secteur);

/* Module GPU */
app.use('/api/gpu/',gpu);

app.listen(port);

module.exports = app;
