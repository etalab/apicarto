var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');

const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');


/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createNaturaProxy(featureTypeName){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            params = _.omit(params,'source_ign');

            /* Value default pour _limit an _start */
             if ( typeof params._start == 'undefined' ) {params._start = 0;}
             if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeName, params)
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
        }
    } else {
		corsOptions = {
			origin : '*',
			optionsSuccessStatus : 200,
			methods:  'GET,POST',
			credentials: true
		}
	}
 callback(null, corsOptions);
}

/**
 * Permet d'alerter en cas de paramètre ayant changer de nom
 * 
 * TODO Principe à valider (faire un middleware de renommage des paramètres si l'approche est trop violente)
 */


var natureValidators = [
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];

/**
 * Récupération des couches natura 2000 suivant au titre la directive Habitat
 * 
 */

var naturaValidators = natureValidators.concat([
    check('sitecode').optional().isAlphanumeric(),
    check('sitename').optional().isAlphanumeric()
]);

router.get('/natura-habitat', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('PROTECTEDAREAS.SIC:sic'));
router.post('/natura-habitat',cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('PROTECTEDAREAS.SIC:sic'));

/**
 * Récupération des couches natura 2000 suivant au titre de la directive Oiseaux
 * 
 */


router.get('/natura-oiseaux', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('PROTECTEDAREAS.ZPS:zps'));
router.post('/natura-oiseaux', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('PROTECTEDAREAS.ZPS:zps'));


/**
* Récupération des couches sur les réserves naturelle Corse
*/

var reserveValidators = natureValidators.concat([
    check('id_mnhn').optional().isAlphanumeric(),
    check('nom').optional().isAlphanumeric()
]);

router.get('/rnc', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.RNC:rnc'));
router.post('/rnc', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.RNC:rnc'));

/**
* Récupération des couches Zones écologiques de nature remarquable
*
*/
router.get('/znieff1',cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.ZNIEFF1:znieff1'));
router.post('/znieff1', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.ZNIEFF1:znieff1'));



router.get('/znieff2', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.ZNIEFF2:znieff2'));
router.post('/znieff2', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.ZNIEFF2:znieff2'));

/**
* Récupération des couches Parcs naturels
*
*/

router.get('/pn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.PN:pn'));
router.post('/pn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.PN:pn'));


module.exports=router;
