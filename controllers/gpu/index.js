var Router = require('express').Router;
var router = new Router();

var gpuWfsClient = require('../../middlewares/gpuWfsClient');

function searchAllFields(req, params,typeName,typeInfo) {
    return new Promise(function(resolve, reject) {
        req.gpuWfsClient.getFeatures(typeName, params)
            .then(function(featureCollection) {
                featureCollection.featureType = typeInfo;
                resolve(featureCollection);
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

router.get('/all', gpuWfsClient, function (req, res) {
    var params = {
        geom:req.query.geom
    };
 
    if (!req.query.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    var search1 = searchAllFields(req,params,'wfs_du:municipality','municipality');
   // var search2 = searchAllFields(req,params,'wfs_du:document','document');
    var search3 = searchAllFields(req,params,'wfs_du:zone_urba','zone-urba');
    var search4 = searchAllFields(req,params,'wfs_sup:acte_sup','acte-sup');
    var search5 = searchAllFields(req,params,'wfs_du:secteur_cc','secteur-cc');
    var search6 =  searchAllFields(req,params,'wfs_du:prescription_lin','prescription-lin');
    var search7 = searchAllFields(req,params,'wfs_du:prescription_pct','prescription-pct');
    var search8 = searchAllFields(req,params,'wfs_du:prescription_surf','prescription-surf');
    var search9 = searchAllFields(req,params,'wfs_sup:assiette_sup_l','assiette-sup-l');
    //  var search10 = searchAllFields(req,params,'wfs_sup:assiette_sup_p','assiette-sup-p');
    var search11 = searchAllFields(req,params,'wfs_sup:assiette_sup_s','assiette-sup-s');
    var search12 = searchAllFields(req,params,'wfs_du:info_surf','info-surf');
    var search13 = searchAllFields(req,params,'wfs_du:info_lin','info-lin');
    var search14 = searchAllFields(req,params,'wfs_du:info_pct','info-pct');
   
    Promise.all([search1,search3,search4,search5,search6,search7,search8,search9,search11,search12,search13,search14])
    //Ligne avec assiette_sup_p et document à activer dés que ça marche et désactiver la ligne au dessus
    //Promise.all([search1,search2,search3,search4,search5,search6,search7,search8,search9,search10,search11,search12,search13,search14])
        .then(function(result){
            res.json(result);   
        })
        .catch(function(err){
            res.status(500).json(err);
        });
});


function createFeatureTypeHandler(typeName){
    var handler = function(req,res){
        if (!req.query.geom)return res.status(400).send({
            code: 400,
            message: 'geom field is required'
        });
        var params = {
            geom:req.query.geom
        };
       
        req.gpuWfsClient.getFeatures(typeName, params)
            .then(function(featureCollection) {
                res.json(featureCollection);
            })
            .catch(function(err) {
                res.status(500).json(err);
            })
        ;
    };
    return handler;
}


router.get('/municipality', gpuWfsClient, createFeatureTypeHandler('wfs_du:municipality'));

router.get('/document', gpuWfsClient, createFeatureTypeHandler('wfs_du:document'));

router.get('/zone-urba', gpuWfsClient, createFeatureTypeHandler('wfs_du:zone_urba'));
router.get('/secteur-cc', gpuWfsClient, createFeatureTypeHandler('wfs_du:secteur_cc'));

router.get('/prescription-pct', gpuWfsClient, createFeatureTypeHandler('wfs_du:prescription_pct'));
router.get('/prescription-lin', gpuWfsClient, createFeatureTypeHandler('wfs_du:prescription_lin'));
router.get('/prescription-surf', gpuWfsClient, createFeatureTypeHandler('wfs_du:prescription_surf'));

router.get('/info-pct', gpuWfsClient, createFeatureTypeHandler('wfs_du:info_pct'));
router.get('/info-lin', gpuWfsClient, createFeatureTypeHandler('wfs_du:info_lin'));
router.get('/info-surf', gpuWfsClient, createFeatureTypeHandler('wfs_du:info_surf'));


router.get('/acte-sup', gpuWfsClient, createFeatureTypeHandler('wfs_sup:acte_sup'));

router.get('/assiette-sup-p', gpuWfsClient, createFeatureTypeHandler('wfs_sup:assiette_sup_p'));
router.get('/assiette-sup-l', gpuWfsClient, createFeatureTypeHandler('wfs_sup:assiette_sup_l'));
router.get('/assiette-sup-s', gpuWfsClient, createFeatureTypeHandler('wfs_sup:assiette_sup_s'));


module.exports=router;
