var Router = require('express').Router;
var prepareParamsCadastre = require('../lib/prepare-params-cadastre.js');
var CadastreClient = require('../lib/CadastreClient.js');


module.exports = function (options) {
    if (!options.key) {
        throw new Error('Key is not defined');
    }

    var router = new Router();
    var cadastreClient = new CadastreClient(options.key, options.referer || 'http://localhost');

    router.use(require('../helpers/extract-insee-code'));

    router.get('/capabilities', function(req, res) {
        cadastreClient.getCapabilities(function(body){
            if (body) {
                res.set('Content-Type', 'text/xml');
                res.send(body);
            } else {
                res.send('Le service distant n\'est pas disponible');
            }
        });
    });

    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/division', function (req,res) {
        var params = prepareParamsCadastre(req, res);
        if(!params.statusCode) {
            cadastreClient.getDivisions(params,function(featureCollection){
                res.json(featureCollection);
            });
        }
    });


    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/parcelle', function (req,res) {
        var params = prepareParamsCadastre(req, res);
        if(!params.statusCode) {
            cadastreClient.getParcelles(params,function(featureCollection){
                res.json(featureCollection);
            });
        }
    });

    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/commune', function (req,res) {
        var params = prepareParamsCadastre(req, res);
        if(!params.statusCode) {
            cadastreClient.getCommune(params,function(featureCollection){
                res.json(featureCollection);
            });
        }
    });

/**
     * Récupération des localisants
     *
     * Paramètres : une feature avec pour nom "geom"...
     *
     */

    router.get('/localisant',function (req,res) {
        var params = prepareParamsCadastre(req, res);
        if(!params.statusCode) {
            cadastreClient.getLocalisant(params,function(featureCollection){
                res.json(featureCollection);
            });
        }
    });

 /**
     * Récupération des informations cadastre et commune
     *
     * Paramètres : une feature avec pour nom "geom"...
     * Mode : GET ou POST
     */

    router.get('/geometrie', function (req,res) {
        if (!req.query.geom)
            return res.status(400).send({ code: 400, message: 'geom field is required'});

        cadastreClient.getCadastreFromGeom(JSON.parse(req.query.geom), function (featureCollection) {
            res.json(featureCollection);
        });
    });

    router.post('/geometrie', function (req, res) {
        if (!req.body.geom)
            return res.status(400).send({ code: 400, message: 'geom field is required'});
        cadastreClient.getCadastreFromGeom(req.body.geom, function (featureCollection) {
            res.json(featureCollection);
        });
    });


    return router;
};
