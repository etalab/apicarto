var format = require('pg-format');
var _ = require('lodash');
var Handlebars = require('handlebars');

var inQuery = Handlebars.compile(`
        SELECT
            {{#if withGeometries}}ST_AsGeoJSON(appellations.geom) AS geom,{{/if}}
            ST_Area(ST_Intersection(input.geom, appellations.geom)::geography) / 10000 AS area,
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
    return format(inQuery(options), options.geometry, options.inseeCodeList);
}

exports.in = function(req, res, next) {
    if (!req.body.geom) {
        res.sendStatus(400);
        return next();
    }

    req.pgClient.query(buildSQLQuery({
        geometry: req.body.geom.geometry,
        withGeometries: req.body.geojson !== false,
        inseeCodeList: _.map(req.intersectedCommunes, 'insee')
    }), function(err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }

        if (!result.rows) {
            return res.status(404).send({ status: 'No Data' });
        }

        if (req.body.geojson === false) {
            return res.send(result.rows);
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
};
