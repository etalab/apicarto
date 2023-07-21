const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

/* Mentions légales */
app.get('/api/doc/mentions', function(req,res){
    res.render('mentions');
});

/*------------------------------------------------------------------------------
 * common middlewares
 ------------------------------------------------------------------------------*/

var env = process.env.NODE_ENV;

if (env === 'production') {
    // see http://expressjs.com/fr/guide/behind-proxies.html
    app.enable('trust proxy');
}

app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.use(require('./middlewares/request-logger')());

/*------------------------------------------------------------------------------
 * /api/doc - expose documentation
 -----------------------------------------------------------------------------*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/doc/views'));
app.use(
    '/api/doc/vendor/swagger-ui',
    express.static(__dirname + '/node_modules/swagger-ui-dist')
);
app.use('/api/doc',  express.static(__dirname + '/doc'));
app.get('/api/doc',function(req,res){
    res.render('index',{datasets: require('./datasets')});
});
app.get('/api/doc/:moduleName', function(req,res){
    res.render('module',{moduleName: req.params.moduleName});
});

app.get('/', function (req, res) {
    res.redirect('/api/doc/');
});

app.get('/api/', function (req, res) {
    res.redirect('/api/doc/');
});
/* -----------------------------------------------------------------------------
 * Routes
 -----------------------------------------------------------------------------*/
/* Module cadastre */
app.use('/api/cadastre',require('./controllers/cadastre'));

/* Module AOC */
app.use('/api/aoc',require('./controllers/aoc'));

/* Module code postaux */
app.use('/api/codes-postaux', require('./controllers/codes-postaux'));

/* Module GPU */
app.use('/api/gpu',require('./controllers/gpu'));

/* Module RPG */
app.use('/api/rpg',require('./controllers/rpg'));

/* Module Nature */
app.use('/api/nature',require('./controllers/nature'));

/* Module all module IGN */
app.use('/api/wfs-geoportail',require('./controllers/wfs-geoportail'));

/* Module Espace Revendeur */
app.use('/api/er',require('./controllers/er'));

/* Module Dreal Corse */
app.use('/api/corse/',require('./controllers/corse'));

/* Endpoints dédié à la surveillance */
app.use('/api/health/',require('./controllers/health'));

module.exports = app;
