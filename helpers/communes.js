var format = require('pg-format');
var debug = require('debug')('communes');

function intersects(options) {
    options = options || {};
    var refs = {
        'osm': {
            prepareQuery: function (geometry) {
                return format(`
                    SELECT
                        nom,
                        insee,
                        ST_Contains(input.geom, communes.geom) AS contains,
                        ST_Area(ST_Intersection(input.geom, communes.geom)::geography) / 10000 AS intersect_area,
                        ST_AsGeoJSON(communes.geom) AS geom,
                    FROM
                        communes,
                        (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
                    WHERE ST_Intersects(communes.geom, input.geom);
                `, geometry);
            }
        },
        'ign-parcellaire': {
            prepareQuery: function (geometry) {
                return format(`
                    SELECT
                        NOM_COM as nom,
                        CODE_INSEE as insee,
                        ST_Contains(input.geom, communes_ign.geom) AS contains,
                        ST_Area(ST_Intersection(input.geom, communes_ign.geom)::geography) / 10000 AS intersect_area,
                        ST_AsGeoJSON(communes_ign.geom) AS geom
                    FROM
                        communes_ign,
                        (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
                    WHERE ST_Intersects(communes_ign.geom, input.geom);
                `, geometry);
            }
        }
    };

    return function (req, res, next) {
        if (!req.body || !req.body.geom) {
            res.status(400).send({ code: 400, message: 'Requête incorrecte' });
            return;
        }

        var ref = refs[options.ref || 'osm'];
        var sqlQuery = ref.prepareQuery(req.body.geom.geometry);

        req.pgClient.query(sqlQuery, (err, result) => {
            if (err) {
                req.pgEnd(err);
                return next(err);
            }

            if (result.rows.length === 0) {
                return res.status(400).send({ code: 400, message: 'Aucune commune correspondant à cette localisation. Hors de France ?' });
            }

            req.intersectedCommunes = result.rows;
            debug('%d communes trouvée(s)', req.intersectedCommunes.length);
            req.intersectedCommunes.forEach((commune) => debug('- %s', commune.nom));
            next();
        });
    };
}

exports.intersects = intersects;
