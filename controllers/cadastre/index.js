var Router = require('express').Router;
var router = new Router();

var prepareParamsCadastre = require('../../lib/prepare-params-cadastre');
var gppWfsClient = require('../../middlewares/gppWfsClient')

/**
* Récupération Géometrie  pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/commune', gppWfsClient, prepareParamsCadastre, require('./commune'));
router.post('/commune', gppWfsClient, prepareParamsCadastre, require('./commune'));

/**
* Récupération des divisions pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/division', gppWfsClient, prepareParamsCadastre, require('./division'));
router.post('/division', gppWfsClient, prepareParamsCadastre, require('./division'));

/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/parcelle', gppWfsClient, prepareParamsCadastre, require('./parcelle') );
router.post('/parcelle', gppWfsClient, prepareParamsCadastre, require('./parcelle') );

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant', gppWfsClient, prepareParamsCadastre, require('./localisant'));
router.post('/localisant', gppWfsClient, prepareParamsCadastre, require('./localisant'));

router.get('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));
router.post('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));


module.exports=router;
