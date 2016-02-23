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

    router.get('/capabilities', function(req, res, next) {
        cadastreClient.getCapabilities(function (err, capabilities) {
            if (err) return next(err);
            res.set('Content-Type', 'text/xml');
            res.send(capabilities);
        });
    });

    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/division', prepareParamsCadastre, function (req, res, next) {
        cadastreClient.getDivisions(req.cadastreParams, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });


    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/parcelle', prepareParamsCadastre, function (req, res, next) {
        cadastreClient.getParcelles(req.cadastreParams, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });

    /**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     */
    router.get('/commune', prepareParamsCadastre, function (req, res, next) {
        cadastreClient.getCommune(req.cadastreParams, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });

/**
     * Récupération des localisants
     *
     * Paramètres : une feature avec pour nom "geom"...
     *
     */

    router.get('/localisant', prepareParamsCadastre, function (req, res, next) {
        cadastreClient.getLocalisant(req.cadastreParams, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
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

        cadastreClient.getCadastreFromGeom(JSON.parse(req.query.geom), function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });

    router.post('/geometrie', function (req, res, next) {
        if (!req.body.geom) return res.status(400).send({
            code: 400,
            message: 'geom field is required'
        });

        cadastreClient.getCadastreFromGeom(req.body.geom, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });


    return router;
};
