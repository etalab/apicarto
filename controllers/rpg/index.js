var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator');
const { matchedData } = require('express-validator');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry} = require('../../checker');

const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');
const lastYearRPG = 2022;
const firstYearRPG = 2010;

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} valeurSearch du chemin le nom de la couche WFS
 */
function createRpgProxy(valeurSearch) {
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeName= '';
            params = _.omit(params,'apikey');
            /*  Modification année dans le flux */
            if (valeurSearch == 'v1') {
                if ((params.annee >= firstYearRPG) && (params.annee <= 2014))  {
                    if (params.annee == 2014) {
                        featureTypeName = 'RPG.' + params.annee + ':ilots_anonymes';
                    } else  {
                        featureTypeName = 'RPG.' + params.annee + ':rpg_' + params.annee;
                    }
                } else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Année Invalide : Valeur uniquement entre ' + firstYearRPG + ' et 2014'
                    });  
                }
            } else {
                if ((params.annee >= 2015) && (params.annee <= lastYearRPG)) {
                    featureTypeName = 'RPG.' + params.annee + ':parcelles_graphiques';
                } else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Année Invalide : Valeur uniquement entre 2015 et ' + lastYearRPG
                    });

                }
            }
            /* Supprimer annee inutile ensuite de params */
            params = _.omit(params,'annee');

            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeName, params)
                /* uniformisation des attributs en sortie */
                .then(function(featureCollection){
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
var rpgValidators = [
    check('annee').exists().isNumeric().isLength({min:4,max:4}).withMessage('Année sur 4 chiffres'),
    check('code_cultu').optional().isString(),
    check('geom').exists().custom(isGeometry).withMessage('La géométrie est invalide.'),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];

/** Nous avons 2 requetes identiques mais il y a une difference dans les champs 
 * Possibilité de traiter différement par la suite.
 * /v1 : corresponds aux années avant 2015
 * /v2 : corresponds aux années à partir de 2015
 */
router.get('/v1', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('v1'));
router.post('/v1', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('V1'));

router.get('/v2', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('v2'));
router.post('/v2', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('V2'));



module.exports=router;
