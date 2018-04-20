const computeSurfaces = require('../../lib/computeSurfaces');

module.exports = function (req, res) {
    if ( ! req.cadastreParams.geom ){
        return res.status(400).send('Missing geom parameter');
    }

    req.gppWfsClient.getFeatures('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle', req.cadastreParams)
        .then(function(featureCollection) {
            return computeSurfaces(featureCollection,req.cadastreParams.geom);
        })
        .then(function(featureCollection){
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
        })
    ;
};
