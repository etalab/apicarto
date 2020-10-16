var Router = require('express').Router;
var router = new Router();
var cors = require('cors');
const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validateParams = require('../../middlewares/validateParams');
const {isGeometry,isCodeInsee} = require('../../checker');

const gppWfsClient = require('../../middlewares/gppWfsClient');
const fluxExterneCorse = require('../../middlewares/fluxExterneCorse');

const _ = require('lodash');


/**
 * Creation d'une chaîne de proxy pour appel flux externe puis utilisation geoportail_wfs_client
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createFluxExterne(featureTypeName){
    var params = params || {};

    var headers = this.getDefaultHeaders();
    headers['Accept'] = 'application/json';

    /*
     * GetFeature params 
     */
    var queryParams = this.getDefaultParams();
    queryParams['outputFormat'] = 'application/json';
    
    
   queryParams['filter']='<wfs:GetFeature service="WFS" version="2.0.0">'
   queryParams['filter'] +='outputFormat="application/json';
   queryParams['filter'] +='xmlns:wfs="http://www.opengis.net/wfs/2.0"';
   queryParams['filter'] +='xmlns:fes="http://www.opengis.net/fes/2.0"';
   queryParams['filter'] +='xmlns:gml="http://www.opengis.net/gml/3.2"';
   queryParams['filter'] +='xmlns:dreal=" https://georchestra.ac-corse.fr/geoserver/wfs?service=wfs"';
   queryParams['filter'] += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance';
   queryParams['filter'] += 'xsi:schemaLocation="http://www.opengis.net/wfs/2.0';
   queryParams['filter'] +='http://schemas.opengis.net/wfs/2.0/wfs.xsd';
   queryParams['filter'] += 'http://www.opengis.net/gml/3.2';
   queryParams['filter'] += 'http://schemas.opengis.net/gml/3.2.1/gml.xsd>"';
   queryParams['filter'] +=<'wfs:Query typeNames="dreal:fsoum_25">';
   queryParams['filter'] +='<fes:Filter>';
        queryParams['filter'] += '<fes:Not>'
        queryParams['filter'] += '<fes:Disjoint>'
        queryParams['filter'] += '<fes:ValueReference>dreal:geom</fes:ValueReference>'
        queryParams['filter'] += '<gml:Polygon'
        queryParams['filter'] +='gml:id="MultiPolygon.1';
        queryParams['filter'] +='srsName="http://www.opengis.net/def/crs/EPSG/0/4326">';
        queryParams['filter'] +='<gml:exterior>';
        queryParams['filter'] +='<gml:LinearRing>';
        queryParams['filter'] += '<gml:posList>-0.288863182067871 48.963666607295977,-0.299592018127441 48.959299208576141,-0.296330451965332 48.955325952385039,-0.282125473022461 48.950675995388366,-0.279722213745117 48.967019382922331,-0.288863182067871 48.963666607295977</gml:posList>';
        queryParams['filter'] += '</gml:LinearRing>';
        queryParams['filter'] += '</gml:exterior>';
        queryParams['filter'] += '</gml:Polygon>';
        queryParams['filter'] += '</fes:Disjoint>';
        queryParams['filter'] += '</fes:Not>';
        queryParams['filter'] += '</fes:Filter>';
        queryParams['filter'] +='</wfs:Query>';
        queryParams['filter'] +='</wfs:GetFeature>';


 
    /*
     * bbox and attribute filter as POST parameter
     */
    var cql_filter = clq_filter(params);
    var body = (cql_filter !== null) ? 'cql_filter=' + cql_filter : '';
    queryParams['cql_filter'] = cql_filter;
    var options= {
        uri:this.getUrl(),
        method:'POST',
        qs: queryParams,
        headers: headers,
        //rejectUnhautorized: false
    };
    return rp(options)
		.then(function(result) {
			return JSON.parse(result);
		}).catch(function(err) {
           return("Erreur: " + err);

        })

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
 * Récupération des couches natura 2000 suivant au titre la directive Habitat
 * 
 */

var naturaValidators = natureValidators.concat([
    check('sitecode').optional().isString(),
    check('sitename').optional().isString()
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
    check('nom').optional().isString()
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


/**
* Récupération des couches Parcs naturels régionaux
*
*/

router.get('/pnr', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.PN:pnr'));
router.post('/pnr', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('PROTECTEDAREAS.PN:pnr'));

/**
* Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
* Flux externe
*/

router.get('/foretcorse',cors(corsOptionsGlobal),corseValidators, createFluxExterne('dreal:fsoum_25'));
router.post('/foretcorse',cors(corsOptionsGlobal),corseValidators, createFluxExterne('dreal:fsoum_25'));

/**
* Recherche flux geoorchectra corse pour les Forêts bénéficiant du régime forestier
*
*/

router.get('/pechecorse',cors(corsOptionsGlobal),corseValidators, createFluxExterne('dreal:res_pech25'));
router.post('/pechecorse',cors(corsOptionsGlobal),corseValidators, createFluxExterne('dreal:res_pech25'));


module.exports=router;
