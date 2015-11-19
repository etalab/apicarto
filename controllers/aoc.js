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
        WHERE appellation.insee IN (%L) AND (appellation.geom IS NULL OR ST_Intersects(appellation.geom, input.geom));
`);

function buildSQLQuery(options) {
    return format(inQuery(options), options.geometry, options.inseeCodeList);
}

function bbox_aoc(bbox) {
    return format(`
        SELECT
            ST_AsGeoJSON(Appellation.geom) AS geom,
            id_uni,
            appellation,
            commune
        FROM
            Appellation,
            (SELECT st_makeenvelope(%s, %s, %s, %s, 4326) geom) d
        WHERE ST_Intersects(d.geom , Appellation.geom)
        LIMIT 50;`
    , bbox[0], bbox[1], bbox[2], bbox[3]);
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
                return {
                    type: 'Feature',
                    geometry: JSON.parse(row.geom),
                    properties: _.omit(row, 'geom')
                };
            })
        });
    });
};

exports.bbox = function (req, res, next) {
    var bbox = req.query.bbox.split(',');
    var sql = bbox_aoc(bbox);

    req.pgClient.query(sql, function(err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }

        if (!result.rows) {
            return res.status(404).send({ status: 'No Data' });
        }

        return res.send({
            type: 'FeatureCollection',
            features: result.rows.map(function (row) {
                return {
                    type: 'Feature',
                    geometry: JSON.parse(row.geom),
                    properties: _.pick(row, 'communes', 'appellation', 'id_uni')
                };
            })
        });
    });
};
