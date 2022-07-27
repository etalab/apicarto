var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator');
const { matchedData } = require('express-validator');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry} = require('../../checker');
const drealCorseWfsClient = require('../../middlewares/drealCorsewfsClient');
const _ = require('lodash');
    
/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
*/
function createCorseProxy(featureTypeName){
    return [
        drealCorseWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);      
            /* requête WFS Flux Corse*/
            req.drealCorseWfsClient.getFeatures(featureTypeName, params)
                .then(function(featureCollection) {
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                });
        }
    ];
}

function createAllCorseProxy(){
    return [
        drealCorseWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeName= params.source;
            params = _.omit(params,'source');
            /* requête WFS Flux Corse*/
            req.drealCorseWfsClient.getFeatures(featureTypeName, params)
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


var natureValidators = [
    check('geom').optional().custom(isGeometry)
];


var corseForetValidators = natureValidators.concat([
    check('ccod_frt').optional().isString(),
    check('llib_frt').optional().isString(),
    check('propriete').optional().isString(),
    check('s_sig_ha').optional().isString(),
    check('dpt').optional().isString(),
    check('nom_fore').optional().isString()

]);

router.get('/foretcorse',cors(corsOptionsGlobal),corseForetValidators, createCorseProxy('dreal:fsoum_25'));
router.post('/foretcorse',cors(corsOptionsGlobal),corseForetValidators, createCorseProxy('dreal:fsoum_25'));

/**
*Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
*
*/

var corsePecheValidators = natureValidators.concat([
    check('dpt').optional().isString()

]);

router.get('/pechecorse',cors(corsOptionsGlobal),corsePecheValidators, createCorseProxy('dreal:res_pech25'));
router.post('/pechecorse',cors(corsOptionsGlobal),corsePecheValidators, createCorseProxy('dreal:res_pech25'));

/**
 * Accès à toutes les couches geochestra.ac-corse.fr
 */

var moduleValidator = [
    check('source').exists().withMessage('Le paramètre source pour le nom de la couche  est obligatoire'),
    check('geom').optional().custom(isGeometry),
 
];

router.get('/search', cors(corsOptionsGlobal),moduleValidator, createAllCorseProxy());
router.post('/search', cors(corsOptionsGlobal),moduleValidator, createAllCorseProxy());

module.exports=router;
