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

var app = express();
var port = process.env.PORT || 8091;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));

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
// app.get('/aoc/api/beta/aoc/bbox', pgClient, aoc.bbox);
app.get('/codes-postaux/communes/:codePostal', codesPostaux.communes);

/* Ready! */
app.listen(port, function () {
    console.log('Start listening on port %d', port);
});
