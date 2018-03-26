var Router = require('express').Router;
var NatureClient = require('../lib/NatureClient.js');

var router = new Router();

router.use(require('../helpers/extract-insee-code'));
router.get('/capabilities', function(req, res, next) {
	var natureClient = new NatureClient(req.query.apikey, req.headers);
    natureClient.getCapabilities(function (err, capabilities) {
    if (err) return next(err);
        res.set('Content-Type', 'text/xml');
        res.send(capabilities);
    });
});
    
 /**
  * Récupération des informations cadastre et commune
  *
  * Paramètres : une feature avec pour nom "geom"...
  * Mode : GET ou POST
 */
router.get('/geometrie', function (req, res, next) {
	var natureClient = new NatureClient(req.query.apikey, req.headers);
    if (!req.query.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    natureClient.getNatureFromGeom(JSON.parse(req.query.geom),req.query.typeSource, function (err, featureCollection) {
        if (err) return next(err);
            res.json(featureCollection);
        });
});

router.post('/geometrie', function (req, res, next) {
	var natureClient = new NatureClient(req.query.apikey, req.headers);
    if (!req.body.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    natureClient.getNatureFromGeom(req.body.geom,req.query.typeSource, function (err, featureCollection) {
    if (err) return next(err);
         res.json(featureCollection);
    });
});

module.exports=router;
