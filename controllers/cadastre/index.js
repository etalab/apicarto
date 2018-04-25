var Router = require('express').Router;
var router = new Router();

var prepareParamsCadastre = require('../../lib/prepare-params-cadastre');
var gppWfsClient = require('../../middlewares/gppWfsClient');

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createCadastreProxy(featureTypeName){
    return [
        gppWfsClient,
        prepareParamsCadastre,
        function(req,res){
            req.gppWfsClient.getFeatures(featureTypeName, req.cadastreParams)
                .then(function(featureCollection) {
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                })
            ;
        }
    ];
}

router.get('/commune', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));
router.post('/commune', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));

/**
* Récupération des divisions pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/division', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));
router.post('/division', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));

/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
router.get('/parcelle', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));
router.post('/parcelle', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant'));
router.post('/localisant', createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant'));

/**
 * Récupération des parcelles avec calcul d'intersection des géométries
 * 
 * TODO : a supprimer ou rendre générique
 */
router.get('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));
router.post('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));


module.exports=router;
