var Router = require('express').Router;
var router = new Router();

const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');
const parseInseeCode = require('../../lib/parse-insee-code');

const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createCadastreProxy(featureTypeName){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            params._limit = 1000;

            /*  insee => code_dep et code_com */
            if ( params.code_insee ){
                var inseeParts = parseInseeCode(params.code_insee);
                params.code_dep = inseeParts.code_dep;
                params.code_com = inseeParts.code_com;
                params = _.omit(params,'code_insee');
            }

            /* hack du couple code_dep et code_com dans le cas des communes */
            if ( featureTypeName.endsWith('commune') ){
                if ( params.code_dep && params.code_com ){
                    params.code_insee = params.code_dep + params.code_com ;
                    params = _.omit(params,'code_com');
                }
            }

            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeName, params)
                /* uniformisation des attributs en sortie */
                .then(function(featureCollection){
                    featureCollection.features.forEach(function(feature){
                        if ( ! feature.properties.code_insee ){
                            feature.properties.code_insee = feature.properties.code_dep+feature.properties.code_com;
                        }
                    })
                    return featureCollection;
                })
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

/**
 * Permet d'alerter en cas de paramètre ayant changer de nom
 * 
 * TODO à finaliser en fonction de lib/prepare-params-cadastre, s'assurer que l'on pourra avoir quelques choses de stable et clair ensuite
 */
var legacyValidators = [
    check('codearr').optional().custom(v => false).withMessage('Le paramètre "codearr" a été remplacé par "code_arr" pour éviter des renommages dans les données et chaînage de requête'),
    check('dep').optional().custom(v => false).withMessage('Le paramètre "dep" a été remplacé par "code_dep" pour éviter des renommages dans les données et chaînage de requête'),
    check('insee').optional().custom(v => false).withMessage('Le paramètre "insee" a été remplacé par "code_insee" pour éviter des renommages dans les données et chaînage de requête'),
];

var communeValidators = legacyValidators.concat([
    check('insee').optional().custom(isCodeInsee),
    check('code_dep').optional().matches(/\w{2,3}/).withMessage('Code département invalide'),
    check('code_com').optional().matches(/\d{2,3}/).withMessage('Code commune invalide'),
    check('nom_com').optional(),
    check('geom').optional().custom(isGeometry)
]);
router.get('/commune', communeValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));
router.post('/commune', communeValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));


var divisionValidators = communeValidators.concat([
    check('section').optional().matches(/\w{2}/).withMessage("Le numéro de section est sur 2 caractères"),
    check('code_arr').optional().matches(/\d{3}/).withMessage("Le code arrondissement est composé de 3 chiffres"),
    check('com_abs').optional().matches(/\d{3}/).withMessage("Le prefixe est composé de 3 chiffres obligatoires")
]);
router.get('/division', divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));
router.post('/division', divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));


/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
var parcelleValidators = divisionValidators.concat([
    check('numero').optional().matches(/\w{4}/).withMessage("Le numéro de parcelle est sur 4 caractères")
]);
router.get('/parcelle', parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));
router.post('/parcelle', parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant', parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant'));
router.post('/localisant', parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant'));

/**
 * Récupération des parcelles avec calcul d'intersection des géométries
 * 
 * TODO : à rendre générique avec un paramètre _area=true/false?
 */
router.get('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));
router.post('/geometrie', gppWfsClient, prepareParamsCadastre, require('./geometrie'));


module.exports=router;
