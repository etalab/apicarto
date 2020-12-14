var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');
const parseInseeCode = require('../../helper/parseInseeCode');

//const erWfsClient = require('../../middlewares/erWfsClient');
const gppWfsClient = require('../../middlewares/gppWfsClient');

const _ = require('lodash');


/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createErProxy(featureTypeName,typeSearch){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            if (typeSearch == 'category')  {
                if (params.name && params.type) {
                    if(params.type == 's') { 
                        // Recherche sur segment_titl
                        params.segment_ti = params.name;
                    } else if (params.type == 't') {
                        //Recherche sur segment_ti
                        params.theme_titl = params.name;
                    }else if (params.type == 'c') {
                        // Recherche sur collection
                        params.collection = params.name;
                   } else {
                        return res.status(400).send({
                            code: 400,
                            message: 'Le champ type contient uniquement les valeurs t, c ou s'
                            });
                    }
                } else {
                    if(params.name || params.type) {
                    return res.status(400).send({
                        code: 400,
                        message: 'Les 2 champs name et type doivent être renseignés pour cette recherche spécfique. Pour Le champ type les valeurs acceptées sont t,c ou s'
                        });
                    }

                }
            }
            params = _.omit(params,'name');
            params = _.omit(params,'type');
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
 * Récuperation des produits de l'espace revendeur
 * 
 */


var erValidators = [
    check('apikey').exists().withMessage('Le paramètre apikey correspondant à la clé ign est obligatoire'),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];

var productValidators = erValidators.concat([
    check('code_ean').optional().isAlphanumeric(),
    check('code_article').optional().isString(),
    check('name').optional().isString(),
    check('sale').optional().isNumeric(),
    check('geom').optional().custom(isGeometry),
    check('type').optional().isString(),
    check('publication_date').optional().isString()
    
]);

router.get('/product', cors(corsOptionsGlobal),productValidators, createErProxy('PLAGE_ER_WFS:product_view ','product'));
router.post('/product',cors(corsOptionsGlobal),productValidators, createErProxy('PLAGE_ER_WFS:product_view ','product'));

/**
 * Récupération des information sur les category dans le flux product_view
 * 
 */

var categoryValidators = erValidators.concat([
    check('name').optional().isString(),
    check('type').optional().isAlphanumeric().isLength({min:1,max:1}).withMessage('Le type est sur 1 caractère'),
    check('category_id').optional().isString()
]);

router.get('/category', cors(corsOptionsGlobal),categoryValidators, createErProxy('PLAGE_ER_WFS:product_view' ,'category'));
router.post('/category', cors(corsOptionsGlobal),categoryValidators, createErProxy('PLAGE_ER_WFS:product_view ','category'));


/**
* Récuperation des informations sur le flux espace_revendeurs:grid_view
*
*/

var gridValidators = erValidators.concat([
    check('name').optional().isString(),
    check('title').optional().isString(),
    check('type').optional().isString(),
    check('zip_codes').optional().matches(/^\d{5}$/).withMessage('zip_codes doit contenir 5 caractères')
]);

router.get('/grid', cors(corsOptionsGlobal),gridValidators, createErProxy('PLAGE_ER_WFS:grid_view','grid'));
router.post('/grid', cors(corsOptionsGlobal),gridValidators, createErProxy('PLAGE_ER_WFS:grid_view','grid'));


module.exports=router;