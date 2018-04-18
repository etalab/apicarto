var Router = require('express').Router;
var prepareParamsCadastre = require('../lib/prepare-params-cadastre');
var CadastreClient = require('../lib/CadastreClient');
var gppWfsClient = require('../middlewares/gppWfsClient')
var router = new Router();

router.use(require('../helpers/extract-insee-code'));

/**
* Récupération Géometrie  pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/commune', gppWfsClient, prepareParamsCadastre, require('./cadastre/commune'));
router.post('/commune', gppWfsClient, prepareParamsCadastre, require('./cadastre/commune'));

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant', gppWfsClient, prepareParamsCadastre, function (req, res, next) {
	req.gppWfsClient.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
		})
    ;
});

/**
* Récupération des divisions pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/division', gppWfsClient, prepareParamsCadastre, function (req, res, next) {
    req.gppWfsClient.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
		})
    ;
});

/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/parcelle', gppWfsClient, prepareParamsCadastre, function (req, res, next) {
	req.gppWfsClient.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
		})
    ;
});


module.exports=router;
