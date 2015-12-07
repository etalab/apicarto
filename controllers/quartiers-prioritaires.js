var format = require('pg-format');
var _ = require('lodash');
var turf = require('turf');
var geojsonhint = require('geojsonhint');
var wkx = require('wkx');

exports.layer = function(req, res, next) {

  if (req.query.bbox) {
    var bbox = req.query.bbox.split(",");
  }
  var sql = `SELECT qp.geom,
                      code_qp,
                      nom_qp,
                      commune_qp FROM quartiers_prioritaires as qp`;
  if (bbox) {
    sql += `,(select st_makeenvelope(${bbox.map(corner => corner)}, 4326) geom) b
                        where b.geom && qp.geom`
  }
  req.pgClient.query(sql, function(err, result) {
    if (err) {
      req.pgEnd(err);
      return next(err);
    }

    if (!result.rows) {
      return res.status(404).send({
        status: 'No Data'
      });
    }

    return res.send({
      type: 'FeatureCollection',
      features: result.rows.map(function(row) {
        var buf = new Buffer(row.geom, 'hex');
        return {
          type: 'Feature',
          geometry: wkx.Geometry.parse(buf).toGeoJSON(),
          properties: _.omit(row, 'geom')
        };
      })
    })
  })
}

exports.search = function(req, res, next) {
  if (!req.body.geo) {
    res.status(400).send({
      status: 'Missing param'
    });
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
      return res.status(404).send({
        status: 'No Data'
      });
    }

    return res.send({
      type: 'FeatureCollection',
      features: result.rows.map(function(row) {
        return {
          type: 'Feature',
          geometry: JSON.parse(row.geom),
          properties: _.omit(row, 'geom')
        };
      })
    });
  });
};
