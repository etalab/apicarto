module.exports = function (req, res, next) {
	res.status(500).json("TODO fonctionnalité à rétablir sur la base de gppWfsClient (_operation=intersects ou intersection)");
    /*
    req.gppWfsClient.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
		})
    ;
    */
};
