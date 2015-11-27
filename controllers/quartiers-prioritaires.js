var format = require('pg-format');
var _ = require('lodash');

exports.search = function(req, res, next) {
    if (!req.body.geo) {
        res.sendStatus(400);
        return next();
    }

    req.pgClient.query(format(`
        SELECT
            ST_AsGeoJSON(quartiers_prioritaires.geom) AS geom,
            code_qp AS code,
            nom_qp AS nom,
            commune_qp AS commune
        FROM
            quartiers_prioritaires,
            (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
        WHERE ST_Intersects(quartiers_prioritaires.geom, input.geom);
    `, req.body.geo), function(err, result) {
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
                    properties: _.omit(row, 'geom')
                };
            })
        });
    });
};
