var Router = require('express').Router;
var GeoportalWfsClient= require('geoportal-wfs-client');
const request = require('request');
var async = require("async");
var router = new Router();



function buildOptions(reqOptions) {
    var referer = reqOptions.headers.referer || 'http://localhost/';
    var optionsInit = {
        "apiKey":  '39wtxmgtn23okfbbs1al2lz3',
        "url" : 'http://wxs-gpu.mongeoportail.ign.fr/externe/39wtxmgtn23okfbbs1al2lz3/wfs/v',
        "headers":{
            Referer: referer
        }
    };
    return optionsInit;
};


function searchAllFields(options, params,typeName,typeInfo) {
    return new Promise(function(resolve, reject) {
        var client = new GeoportalWfsClient(options);
        client.getFeatures(typeName, params)
            .then(function(featureCollection) {
                featureCollection.featureType = typeInfo;
                resolve(featureCollection);
            })
            .catch(function(err) {
                console.log(err);
            });
    })
    .catch(function(err){
        //return error;
        return err;
    });
   
}
router.get('/all',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };
 
    if (!req.query.geom) return res.status(400).send({
        code: 400,
        message: 'geom field is required'
    });
    var search1 = searchAllFields(options,params,'wfs_du:municipality','municipality');
    var search2 = searchAllFields(options,params,'wfs_du:doc_urba','doc_urba');
    var search3 = searchAllFields(options,params,'wfs_du:zone_urba','zone_urba');
    var search4 = searchAllFields(options,params,'wfs_sup:acte_sup','acte_sup');
    var search5 = searchAllFields(options,params,'wfs_du:secteur_cc','secteur_cc');
    var search6 =  searchAllFields(options,params,'wfs_du:prescription_lin','prescription_lin');
    var search7 = searchAllFields(options,params,'wfs_du:prescription_pct','prescription_pct');
    var search8 = searchAllFields(options,params,'wfs_du:prescription_surf','prescription_surf');
    var search9 = searchAllFields(options,params,'wfs_sup:assiette_sup_l','assiette_sup_l');
    //  var search10 = searchAllFields(options,params,'wfs_sup:assiette_sup_p','assiette_sup_p');
    var search11 = searchAllFields(options,params,'wfs_sup:assiette_sup_s','assiette_sup_s');
    var search12 = searchAllFields(options,params,'wfs_du:info_surf','info_surf');
    var search13 = searchAllFields(options,params,'wfs_du:info_lin','info_lin');
    var search14 = searchAllFields(options,params,'wfs_du:info_pct','info_pct');
   
    Promise.all([search1,search2,search3,search4,search5,search6,search7,search8,search9,search11,search12,search13,search14])
        .then(function(result){
            res.json(result);   
        })
        .catch(function(err){
            console.error('err', err);
        });
});
	
router.get('/municipality',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:municipality', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get('/docurba',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:doc_urba', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/zoneurba',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:zone_urba', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get('/actesup',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_sup:acte_sup', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/secteurcc',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:secteur_cc', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/prescription-lin',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:prescription_lin', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/prescription-pct',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:prescription_pct', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/prescription-surf',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:prescription_surf', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/assiette-sup-l',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_sup:assiette_sup_l', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get('/assiette-sup-p',function (req, res, next) {

    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_sup:assiette_sup_p', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});


router.get('/assiette-sup-s',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_sup:assiette_sup_s', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get('/info-surf',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:info_surf', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/info-lin',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:info_lin', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});
router.get('/info-pct',function (req, res, next) {
	
    var options = buildOptions(req);
    var params = {
        geom:req.query.geom
    };

    var client = new GeoportalWfsClient(options);
    client.getFeatures('wfs_du:info_pct', params)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            console.log(err);
        });
});


module.exports=router;
