var Router = require('express').Router;
var prepareParamsCadastre = require('../lib/prepare-params-cadastre.js');
var CadastreClient = require('../lib/CadastreClient.js');

var GeoportalWfsClient = require('geoportal-wfs-client');

var router = new Router();

function buildOptions(reqOptions) {
    if (!reqOptions.params.apiKey) return res.status(400).send({
        code: 400,
        message: 'apiKey IGN is required'
    });
    var referer = reqOptions.headers.referer || 'http://localhost';
    var optionsInit = {
        "apiKey":  reqOptions.params.apiKey,
        "headers":{
            Referer: referer
        }
    };
    return optionsInit;
};


router.use(require('../helpers/extract-insee-code'));

router.get('/capabilities/:apiKey', function(req, res, next) {
    var cadastreClient = new CadastreClient(req.params.apiKey, req.headers);
    cadastreClient.getCapabilities(function (err, capabilities) {
        if (err) return next(err);
        res.set('Content-Type', 'text/xml');
        res.send(capabilities);
    });
});


/**
* Récupération Géometrie  pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/

router.get('/commune/:apiKey',prepareParamsCadastre, function (req, res, next) {
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/

router.get('/localisant/:apiKey',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
		})
        .catch(function(err) {
            console.log(err);
		});
});

/**
* Récupération des divisions pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/

router.get('/division/:apiKey/',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
    });
});
/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/parcelle/:apiKey',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

/**
     * Récupération des informations cadastre et commune
     *
     * Paramètres : une feature avec pour nom "geom"...
     * Mode : GET ou POST
     */

router.get('/geometrie/:apiKey', function (req, res, next) {
    var cadastreClient = new CadastreClient(req.params.apiKey, req.headers);
	
    if (!req.query.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    cadastreClient.getCadastreFromGeom(JSON.parse(req.query.geom), function (err, featureCollection) {
        if (err) return next(err);
        res.json(featureCollection);
    });
});

router.post('/geometrie/:apiKey', function (req, res, next) {
    var cadastreClient = new CadastreClient(req.params.apiKey, req.headers);
    if (!req.body.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    cadastreClient.getCadastreFromGeom(req.body.geom, function (err, featureCollection) {
        if (err) return next(err);
        res.json(featureCollection);
    });
});

module.exports=router;
