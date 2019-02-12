var Router = require('express').Router;
var cors = require('cors');
var router = new Router();

const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const isGeometry = require('../../checker/isGeometry');
const validateParams = require('../../middlewares/validateParams');

var gpuWfsClient = require('../../middlewares/gpuWfsClient');


/**
 * Creation d'une chaîne de proxy sur le GPU
 * @param {Object} typeName 
 */
function createGpuProxy(typeName){
    return [
        validateParams,
        gpuWfsClient,
        function(req,res){
            var params = matchedData(req);
            params._limit = 100;
            req.gpuWfsClient.getFeatures(typeName, params)
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

/*--------------------------------------------------------------------------------------------
 * DU
 -------------------------------------------------------------------------------------------*/

const mapping = {
    'municipality': 'wfs_du:municipality',
    'document': 'wfs_du:document',
    'zone-urba': 'wfs_du:zone_urba',
    'secteur-cc': 'wfs_du:secteur_cc',
    'prescription-pct': 'wfs_du:prescription_pct',
    'prescription-lin': 'wfs_du:prescription_lin',
    'prescription-surf': 'wfs_du:prescription_surf',
    'info-pct': 'wfs_du:info_pct',

    'acte-sup': 'wfs_sup:acte_sup',
    'assiette-sup-p': 'wfs_sup:assiette_sup_p',
    'assiette-sup-l': 'wfs_sup:assiette_sup_l',
    'assiette-sup-s': 'wfs_sup:assiette_sup_s'
};


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
			origin : 'http://apicarto.ign.fr',
			optionsSuccessStatus : 200,
			methods:  'GET,POST',
			credentials: true
		}
	}
 callback(null, corsOptions);
}

router.get('/municipality',cors(corsOptionsGlobal), [
    check('geom').optional().custom(isGeometry),
    check('insee').optional().isAlphanumeric()
], createGpuProxy(mapping['municipality']));


router.get('/document',cors(corsOptionsGlobal), [
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['document']));


router.get('/zone-urba', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['zone-urba']));

router.get('/secteur-cc', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['secteur-cc']));


router.get('/prescription-pct', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['prescription-pct']));

router.get('/prescription-lin', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy('wfs_du:prescription_lin'));

router.get('/prescription-surf', cors(corsOptionsGlobal), [
    check('geom').exists().custom(isGeometry)
], createGpuProxy('wfs_du:prescription_surf'));

router.get('/info-pct', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['info-pct']));

router.get('/info-lin', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['info-lin']));

router.get('/info-surf', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['info_surf']));

/*--------------------------------------------------------------------------------------------
 * SUP
 -------------------------------------------------------------------------------------------*/

router.get('/acte-sup', cors(corsOptionsGlobal), [
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['acte-sup']));

router.get('/assiette-sup-p', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['assiette-sup-p']));

router.get('/assiette-sup-l', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['assiette-sup-l']));

router.get('/assiette-sup-s', cors(corsOptionsGlobal),[
    check('geom').exists().custom(isGeometry)
], createGpuProxy(mapping['assiette-sup-s']));


/*--------------------------------------------------------------------------------------------
 * Recherche dans toutes les tables par geom...
 -------------------------------------------------------------------------------------------*/
router.get('/all', cors(corsOptionsGlobal), [
    check('geom').exists().withMessage('Le paramètre geom est obligatoire'),
    check('geom').custom(isGeometry)
], validateParams, gpuWfsClient, function(req,res){
    /**
     * Récupération des paramètres
     */
    var params = matchedData(req);
    // Limite de 500 par type
    params._limit = 500;

    /**
     * Préparation d'une série de sous-requêtes
     */
    var promises = [];
    for ( var name in mapping ){
        var typeName = mapping[name];

        var promise = new Promise(function(resolve, reject) {
            req.gpuWfsClient.getFeatures(typeName, params)
                .then(function(featureCollection) {
                    featureCollection.featureType = name;
                    resolve(featureCollection);
                })
                .catch(function(err) {
                    err.featureType = typeName;
                    reject(err);
                })
            ;
        });

        promises.push(promise);
    }

    /**
     * Exécution des sous-requêtes et renvoi du résultat
     */
    Promise.all(promises).then(function(result){
        res.json(result);   
    }).catch(function(err){
        res.status(500).json(err);
    });
});


module.exports=router;
