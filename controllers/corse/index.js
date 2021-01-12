var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');
//var corseWfsClient = require('../../lib/ClientDreal.js');
const drealCorseWfsClient = require('../../middlewares/drealCorsewfsClient');
const _ = require('lodash');


/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS

function createCorseProxy(featureTypeName){
    return [
        corseWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);

            /* Value default pour _limit an _start 
             if ( typeof params._start == 'undefined' ) {params._start = 0;}
             if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP
            req.corseWfsClient.getFeatures(featureTypeName, params)
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
*/
   
    
    
    
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
                console.log(params);
                /* requête WFS GPP*/
                req.drealCorseWfsClient.getFeatures(featureTypeName, params)
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


var corseValidators = natureValidators.concat([
    check('ccod_frt').optional().isString(),
    check('llib_frt').optional().isString(),
    check('propriete').optional().isString(),
    check('s_sig_ha').optional().isString(),
    check('dpt').optional().isString(),
    check('nom_fore').optional().isString()

]);

router.get('/foretcorse',cors(corsOptionsGlobal),corseValidators, createCorseProxy('dreal:fsoum_25'));
router.post('/foretcorse',cors(corsOptionsGlobal),corseValidators, createCorseProxy('dreal:fsoum_25'));

/**
* Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
*
*/

router.get('/pechecorse',cors(corsOptionsGlobal),corseValidators, createCorseProxy('dreal:res_pech25'));
router.post('/pechecorse',cors(corsOptionsGlobal),corseValidators, createCorseProxy('dreal:res_pech25'));



module.exports=router;
