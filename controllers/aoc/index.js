var Router = require('express').Router;
var router = new Router();

var pgClient = require('../../middlewares/pgClient');

var format = require('pg-format');
var _ = require('lodash');


router.post('/appellation-viticole', pgClient, function(req, res, next) {

    if (!req.body.geom) {
        return res.status(400).json({
            code: 400,
            message: 'Paramètre "geom" manquant'
        });
    }

    var sql = format(`
        SELECT 
            id,
            new_insee,
            new_nomcom,
            old_insee,
            old_nomcom,
            type_ig,
            id_app,
            appellation,
            id_denom,
            denomination,
            crinao,
            ST_AsGeoJSON(geom) as geom 
        FROM 
            inao.appellation
        WHERE ST_Intersects(
            geom,
            ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326)
        )        
        LIMIT 1000
    `,req.body.geom);

    req.pgClient.query(sql,function(err,result){
        if (err)
            return next(err);

        return res.send({
            type: 'FeatureCollection',
            features: result.rows.map(function (row) {
                const feature = {
                    type: 'Feature',
                    geometry: JSON.parse(row.geom),
                    properties: _.omit(row, 'geom')
                };
                /*
                if (row.granularite === 'commune' && !row.instruction_obligatoire) {
                    const commune = _.find(req.intersectedCommunes, { insee: row.insee });
                    feature.properties.area = commune.intersect_area;
                    feature.properties.contains = commune.contains;
                    feature.geometry = JSON.parse(commune.geom);
                }
                */
                return feature;
            })
        });
    });
});


module.exports = router;
