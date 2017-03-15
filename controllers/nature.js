var Router = require('express').Router;
var prepareParamsCadastre = require('../lib/prepare-params-cadastre.js');
var NatureClient = require('../lib/NatureClient.js');


module.exports = function (options) {
    if (!options.key) {
        throw new Error('Key is not defined');
    }

    var router = new Router();
    var natureClient = new NatureClient(options.key, options);
    router.use(require('../helpers/extract-insee-code'));

    router.get('/capabilities', function(req, res, next) {
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
        if (!req.body.geom) return res.status(400).send({
            code: 400,
            message: 'geom field is required'
        });

        natureClient.getNatureFromGeom(req.body.geom,req.query.typeSource, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });


    return router;
};
