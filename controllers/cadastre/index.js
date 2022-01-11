var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');
const parseInseeCode = require('../../helper/parseInseeCode');

const gppWfsClient = require('../../middlewares/cadastreWfsClient');

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
            var featureTypeNameFinal = featureTypeName;
            params = _.omit(params,'apikey');
            if ((params.source_ign) && (featureTypeName != 'BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad') && (featureTypeName != 'CADASTRALPARCELS.PARCELLAIRE_EXPRESSG:feuille')) {
                if(params.source_ign.toUpperCase() == 'PCI') {
                    featureTypeNameFinal = featureTypeName.replace('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G', 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS');
                } else if(params.source_ign.toUpperCase() == 'BDP') {
                    featureTypeNameFinal = featureTypeName;
                }  else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Pour une recherche sur la couche PCI EXPRESS : la valeur doit être PCI.Pour une recherche sur la couche BD Parcellaire: la valeur doit être BDP.'
                    });

                }
            }
            params = _.omit(params,'source_ign');

            /*  insee => code_dep et code_com */
            if ( params.code_insee ){
                var inseeParts = parseInseeCode(params.code_insee);
                params.code_dep = inseeParts.code_dep;
                params.code_com = inseeParts.code_com;
                params = _.omit(params,'code_insee');
            }

            /* hack du couple code_dep et code_com dans le cas des communes */
            if ( featureTypeNameFinal.endsWith('commune') ){
                if ( params.code_dep && params.code_com ){
                    params.code_insee = params.code_dep + params.code_com ;
                    params = _.omit(params,'code_com');
                    params = _.omit(params,'code_dep');
                }
            }

            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeNameFinal, params)
                /* uniformisation des attributs en sortie */
                .then(function(featureCollection){
                    featureCollection.features.forEach(function(feature){
                        if ( ! feature.properties.code_insee ){
                            feature.properties.code_insee = feature.properties.code_dep+feature.properties.code_com;
                        }
                    });
                    return featureCollection;
                })
                .then(function(featureCollection) {
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                });
        }
    ];
}


var corsOptionsGlobal = function(origin,callback) {
    var corsOptions;
    if (origin) {
        corsOptions = {
            origin: origin,
            optionsSuccessStatus: 200,
            methods: 'GET,POST',
            credentials: true
        };
    } else {
        corsOptions = {
            origin : '*',
            optionsSuccessStatus : 200,
            methods:  'GET,POST',
            credentials: true
        };
    }
    callback(null, corsOptions);
};

/**
 * Permet d'alerter en cas de paramètre ayant changer de nom
 * 
 * TODO Principe à valider (faire un middleware de renommage des paramètres si l'approche est trop violente)
 */


var legacyValidators = [
    check('codearr').optional().custom(function(){return false;}).withMessage('Le paramètre "codearr" a été remplacé par "code_arr" pour éviter des renommages dans les données et chaînage de requête'),
    check('dep').optional().custom(function(){return false;}).withMessage('Le paramètre "dep" a été remplacé par "code_dep" pour éviter des renommages dans les données et chaînage de requête'),
    check('insee').optional().custom(function(){return false;}).withMessage('Le paramètre "insee" a été remplacé par "code_insee" pour éviter des renommages dans les données et chaînage de requête'),
    check('source_ign').optional().isString().isLength({min:3,max:3}).withMessage('Les seules valeurs possibles sont: PCI pour utiliser les couches PCI-Express ou BDP pour utiliser les couches BD Parcellaires')
];

var communeValidators = legacyValidators.concat([
    check('code_insee').optional().custom(isCodeInsee),
    check('code_dep').optional().isAlphanumeric().isLength({min:2,max:2}).withMessage('Code département invalide'),
    check('code_com').optional().isNumeric().isLength({min:2,max:3}).withMessage('Code commune invalide'),
    check('nom_com').optional(),
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
]);

router.get('/commune', cors(corsOptionsGlobal),communeValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));
router.post('/commune',cors(corsOptionsGlobal),communeValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune'));

/**
 * Récupération des divisions de la BDParcellaire
 * la valeur source_ign ne sera pas utilisée pour la recherche.
 * Nous avons la requête module pour faire directement une recherche sur PCI EXPRESS
 */

var divisionValidators = communeValidators.concat([
    check('section').optional().isAlphanumeric().isLength({min:2,max:2}).withMessage('Le numéro de section est sur 2 caractères'),
    check('code_arr').optional().isNumeric().isLength({min:3,max:3}).withMessage('Le code arrondissement est composé de 3 chiffres'),
    check('com_abs').optional().isNumeric().isLength({min:3,max:3}).withMessage('Le prefixe est composé de 3 chiffres obligatoires')
]);
router.get('/division', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));
router.post('/division', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));


/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
var parcelleValidators = divisionValidators.concat([
    check('numero').optional().matches(/\w{4}/).withMessage('Le numéro de parcelle est sur 4 caractères')
]);
router.get('/parcelle', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));
router.post('/parcelle', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle'));

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant',cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant'));
router.post('/localisant', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84Glocalisant'));


/**
 * Récupérations des feuilles(divisions sur BDParcellaire) pour PCI Express
 * Les champs validator sont identiques aux divisions
 * 
 */

router.get('/feuille', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille'));
router.post('/feuille', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille'));


module.exports=router;
