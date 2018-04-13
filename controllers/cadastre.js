var Router = require('express').Router;
var prepareParamsCadastre = require('../lib/prepare-params-cadastre.js');
var CadastreClient = require('../lib/CadastreClient.js');

var GeoportalWfsClient = require('geoportal-wfs-client');

var router = new Router();

function buildOptions(reqOptions) {
    if (!reqOptions.query.apikey) throw new Error('apikey IGN is required');
    var referer = reqOptions.headers.referer || 'http://localhost';
    var optionsInit = {
        "apiKey":  reqOptions.query.apikey,
        "url": 'http://wxs.ign.fr/{apiKey}/geoportail/wfs',
        "headers":{
            Referer: referer
        }
    };
    return optionsInit;
};


router.use(require('../helpers/extract-insee-code'));

router.get('/capabilities/', function(req, res, next) {

    var cadastreClient = new CadastreClient(req.query.apikey, req.headers);
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

router.get('/commune',prepareParamsCadastre, function (req, res, next) {
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            next(err);
		})
    ;
});

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/

router.get('/localisant',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
		})
        .catch(function(err) {
            next(err);
		})
    ;
});

/**
* Récupération des divisions pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/

router.get('/division',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            next(err);
		})
    ;
});
/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/parcelle',prepareParamsCadastre, function (req, res, next) {
	
    var options = buildOptions(req);
    var client = new GeoportalWfsClient(options);
    client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            next(err);
		})
    ;
});

/**
 * Récupération des informations cadastre et commune
 *
 * Paramètres : une feature avec pour nom "geom"...
 * Mode : GET ou POST
 */
router.get('/geometrie', function (req, res, next) {
    var cadastreClient = new CadastreClient(req.query.apikey, req.headers);
	
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
    var cadastreClient = new CadastreClient(req.query.apikey, req.headers);
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
