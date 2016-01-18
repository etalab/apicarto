var format = require('pg-format');
var _ = require('lodash');
var Handlebars = require('handlebars');

var inQuery = Handlebars.compile(`
        SELECT
            {{#if withGeometries}}ST_AsGeoJSON(appellation.geom) AS geom,{{/if}}
            ST_Area(ST_Intersection(input.geom, appellation.geom)::geography) / 10000 AS area,
            appellation,
            idapp,
            id_uni,
            insee,
            segment,
            instruction_obligatoire,
            granularite,
            ST_Contains(input.geom, appellation.geom) AS contains
        FROM
            (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input,
            appellation
        WHERE appellation.insee IN (%L);
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
        inseeCodeList: _.pluck(req.intersectedCommunes, 'insee')
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

exports.search = function (req, res, next) {
    if (!req.query.commune) res.sendStatus(400);

    req.pgClient.query(format(`
        SELECT
            ST_AsGeoJSON(appellation.geom) AS geom,
            appellation AS nom,
            idapp AS id,
            id_uni AS id_geom,
            insee AS commune,
            segment,
            instruction_obligatoire,
            granularite
        FROM appellation
        WHERE insee = '%s';`
    , req.query.commune), function (err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }

        return res.send({
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: JSON.parse(row.geom),
                properties: _.omit(row, 'geom')
            }))
        });
    });
};
