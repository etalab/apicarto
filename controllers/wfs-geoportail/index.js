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
 * @param {String} valeurSearch du chemin le nom de la couche WFS
 */
function createWfsProxy() {
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeName= params.source;
            console.log('value:'+req.query.apikey);
            if (typeof req.query.apikey == 'undefined') {
                return res.status(400).send({
                    code: 400,
                    message: 'La clé ign (apikey) doit être renseignée'
                })
            }
            params = _.omit(params,'source');
            params = _.omit(params,'apikey');
            /* Value default pour _limit an _start */
             if ( typeof params._start == 'undefined' ) {params._start = 0;}
             if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeName, params)
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
                    console.log(err);
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
var moduleValidator = [
    check('apikey').exists().withMessage('Le paramètre apikey correspondant à la clé ign est obligatoire'),
    check('source').exists().withMessage('Le paramètre source pour le nom de la couche WFS géoportail  est obligatoire'),
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];


 
router.get('/search', cors(corsOptionsGlobal),moduleValidator, createWfsProxy());



module.exports=router;
