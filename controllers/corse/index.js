'use strict';
var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');

const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');

function geoportailRequest(options, done) {
    request(options, function(err, response, body) {
        if (err) return done(err);
        if (response.statusCode !== 200) {
            const error = new Error('Géoportail returned an error: ' + response.statusCode);
            error.responseBody = body;
            error.statusCode = response.statusCode;
            return done(error);
        }
        if (options.expectedFormat &&
            response.headers['content-type'] &&
            !response.headers['content-type'].includes(options.expectedFormat)) {
            const error = new Error(`Géoportail returned an unexpected format: ${response.headers['content-type']}. Expected: ${options.expectedFormat}`);
            error.responseBody = body;
            return done(error);
        }
        done(null, body);
    });
}

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
* Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
* Flux externe
*/

router.get('/foretcorse',cors(corsOptionsGlobal),natureValidators,corseNaturaProxy('dreal:fsoum_25'));

router.post('/foretcorse',cors(corsOptionsGlobal),natureValidators, corseNaturaProxy('dreal:fsoum_25'));

/**
* Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
*
*/

router.get('/pechecorse',cors(corsOptionsGlobal),natureValidators, corseNaturaProxy('dreal:res_pech25'));
router.post('/pechecorse',cors(corsOptionsGlobal),natureValidators, corseNaturaProxy('dreal:res_pech25'));


/**
     * Récupération des divisions pour une commune.
     *
     * Paramètres : code_dep=25 et code_com=349
     *
     
    router.get('/parcelle', prepareParamsCadastre, function (req, res, next) {
        cadastreClient.getParcelles(req.cadastreParams, function (err, featureCollection) {
            if (err) return next(err);
            res.json(featureCollection);
        });
    });*/

module.exports=router;
