var format = require('pg-format');
var debug = require('debug')('apicarto');

/**
 * Middleware définissant req.intersectedCommunes en fonction de req.body.geom
 * 
 * @param {Object} options
 * @param {string} options.ref référentiel des communes ('osm' ou 'adminexpress')
 * 
 * @deprecated utilisé précédemment dans /aoc/api/beta/in, à réfactorer sous forme d'un module dédié (/api/administratif/commune)?
 */
function intersects(options) {
    options = options || {};
    var refs = {
        'osm': {
            prepareQuery: function (geometry) {
                return format(`
                    SELECT
                        nom,
                        insee,
                        ST_Contains(input.geom, c.geom) AS contains,
                        ST_Area(ST_Intersection(input.geom, c.geom)::geography) / 10000 AS intersect_area,
                        ST_AsGeoJSON(c.geom) AS geom
                    FROM
                        osm.commune c,
                        (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
                    WHERE ST_Intersects(c.geom, input.geom);
                `, geometry);
            }
        },
        'adminexpress': {
            prepareQuery: function (geometry) {
                return format(`
                    SELECT
                        c.nom_com as nom,
                        c.insee_com as insee,
                        ST_Contains(input.geom, c.geom) AS contains,
                        ST_Area(ST_Intersection(input.geom, c.geom)::geography) / 10000 AS intersect_area,
                        ST_AsGeoJSON(c.geom) AS geom
                    FROM
                        adminexpress.commune c,
                        (SELECT ST_SetSRID(ST_GeomFromGeoJSON('%s'), 4326) geom) input
                    WHERE ST_Intersects(c.geom, input.geom);
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
        var sqlQuery = ref.prepareQuery(req.body.geom);
        debug('%',sqlQuery);
        req.pgClient.query(sqlQuery, (err, result) => {
            if (err) {
                return next(err);
            }

            if (result.rows.length === 0) {
                return res.status(400).send({
                    code: 400, 
                    message: 'Aucune commune correspondant à cette localisation.' 
                });
            }

            req.intersectedCommunes = result.rows;
            debug('%d communes trouvée(s)', req.intersectedCommunes.length);
            req.intersectedCommunes.forEach((commune) => debug('- %s', commune.nom));
            next();
        });
    };
}

exports.intersects = intersects;
