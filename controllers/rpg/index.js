var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');

const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');
const lastYearRPG = '2018';

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createRpgProxy(featureTypeName){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);

            /*  insee => code_dep et code_com */
            if ( params.annee ){
                // Remplacer XXXX dans FeatureName pour l'année de la couche
                featureTypeName = featureTypeName.replace('{annee}', params.annee);
            } else {
                // on met l'année par défaut de la couche
                featureTypeName = featureTypeName.replace('{annee}', lastYearRPG);
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
var rpgValidators = [
    check('annee').optional().isNumeric().isLength({min:4,max:4}).withMessage('Année sur 4 chiffres'),
    check('code_cultu').optional().isString(),
    check('geom').optional().custom(isGeometry)
];

router.get('/parcelle', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('RPG.{annee}:parcelles_graphiques'));
router.post('/parcelle', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('RPG.{annee}:parcelles_graphiques'));


module.exports=router;
