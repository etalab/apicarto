var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

var port = process.env.PORT || 8091;


/*------------------------------------------------------------------------------
 * common middlewares
 ------------------------------------------------------------------------------*/

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
 * /api/doc - expose documentation
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


/* -----------------------------------------------------------------------------
 * Routes
 -----------------------------------------------------------------------------*/

/* Module cadastre */
app.use('/api/cadastre',require('./controllers/cadastre'));

/* Module AOC */
var aoc = require('./controllers/aoc');
var communesHelper = require('./helpers/communes');
var pgClient = require('./middlewares/pgClient');
app.post('/aoc/api/beta/aoc/in', pgClient, communesHelper.intersects({ ref: 'ign-parcellaire' }), aoc.in);

/* Module code postaux */
app.use('/api/codes-postaux', require('./controllers/codes-postaux'));

/* Module GPU */
app.use('/api/gpu',require('./controllers/gpu'));

app.listen(port);

module.exports = app;
