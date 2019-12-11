var Router = require('express').Router;
var router = new Router();

const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const isGeometry = require('../../checker/isGeometry');
const validateParams = require('../../middlewares/validateParams');

var pgClient = require('../../middlewares/pgClient');

var format = require('pg-format');
var _ = require('lodash');

/**
 * Récupération des AOC viticoles par géométrie
 */
router.post('/appellation-viticole', [
    check('geom').exists().withMessage('Le paramètre geom est obligatoire'),
    check('geom').custom(isGeometry)
], validateParams, pgClient, function(req, res, next) {
    var params = matchedData(req);

    var sql = format(`
        SELECT 
        appellation,
        idapp,
        id_uni,
        insee,
        segment,
        instruction_obligatoire,
        granularite,
        ST_AsGeoJSON(geom) as geom
        FROM 
            appellations
        WHERE ST_Intersects(
            geom,
            ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326)
        )    
        LIMIT 1000
    `, params.geom );
    
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
