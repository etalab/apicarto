var Router = require('express').Router;
var router = new Router();
var format = require('pg-format');
const { check } = require('express-validator');
const { matchedData } = require('express-validator');
const isGeometry = require('../../checker/isGeometry');
const validateParams = require('../../middlewares/validateParams');

var pgClient = require('../../middlewares/pgClient');
var _ = require('lodash');
var Handlebars = require('handlebars');

var reqAppellations = Handlebars.compile(`
        SELECT
            {{#if withGeometries}}ST_AsGeoJSON(appellations.geom) AS geom,{{/if}}
            appellation,
            idapp,
            id_uni,
            insee,
            segment,
            instruction_obligatoire,
            granularite,
            ST_Contains(input.geom, appellations.geom) AS contains
        FROM
            (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input,
            appellations
        WHERE appellations.insee IN (%L);
`);

function buildSQLQuery(options) {
    return format(reqAppellations(options), options.geometry, options.inseeCodeList);
}

/**
 * Récupération des AOC viticoles par géométrie
 */
router.post('/appellation-viticole', [
    check('geom').exists().withMessage('Le paramètre geom est obligatoire'),
    check('geom').custom(isGeometry)
], validateParams, pgClient, function(req, res, next) {
    var params = matchedData(req);
    
    var sqlCommunes = format(`
        
		SELECT
        NOM_COM as nom,
        CODE_INSEE as insee,
        ST_Contains(input.geom, communes_ign.geom) AS contains,
        ST_AsGeoJSON(communes_ign.geom) AS geom
        FROM
			communes_ign,
            (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
        WHERE ST_Intersects(communes_ign.geom, input.geom);
        `, params.geom);
    
    req.pgClient.query(sqlCommunes,function(err,result){  
        if (err) return next(err);
        req.intersectedCommunes = result.rows;   
        req.pgClient.query(buildSQLQuery({
            geometry: params.geom,
            withGeometries: req.body.geojson !== false,
            inseeCodeList: _.map(req.intersectedCommunes, 'insee')
        }), function(err, result) {
            if (err) {
                return next(err);
            }
            if (!result.rows) {
                return res.status(404).send({ status: 'No Data' });
            }
    
            return res.send({
                type: 'FeatureCollection',
                features: result.rows.map(function (row) {
                    const feature = {
                        type: 'Feature',
                        geometry: JSON.parse(row.geom),
                        properties: _.omit(row, 'geom')
                    };
                    if (row.granularite === 'commune' && !row.instruction_obligatoire) {
                        const commune = _.find(req.intersectedCommunes, { insee: row.insee });
                        feature.properties.area = commune.intersect_area;
                        feature.properties.contains = commune.contains;
                        feature.geometry = JSON.parse(commune.geom);
                    }
                    return feature;
                })
            });
        });
    });
});

module.exports = router;
