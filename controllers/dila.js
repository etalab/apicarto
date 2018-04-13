var _ = require('lodash');

exports.search = function(req, res, next) {

    if (!req.query.insee) {
        res.status(400).send({
            status: 'Missing param Insee'
        });
    }
    var sql = "SELECT \
                  o.type,o.nom, o.insee,o.source,o.maj,o.url,o.telephone,o.telecopie,o.email,o.ouvertures,o.adresse,\
                  ST_AsGeoJSON(o.geometry) as geom\
              FROM dila.commune c LEFT JOIN dila.organisme o ON o.id = c.organisme_id \
              WHERE c.insee='"+req.query.insee+"'";
    if((req.query.typeOrga) &&(req.query.typeOrga !="Tous les organismes")) { 
        sql = sql + "and o.type='"+req.query.typeOrga+"'";
    }
    req.pgClient.query(sql, function(err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }
       
        if (!result.rows) {
            return res.status(404).send({
                status: 'No Data for your search'
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

exports.searchType = function(req, res, next) {

    if (!req.query.insee) {
        res.status(400).send({
            status: 'Missing param Insee'
        });
    }
    var sql = "SELECT \
                  DISTINCT(o.type)\
              FROM dila.commune c LEFT JOIN dila.organisme o ON o.id = c.organisme_id \
              WHERE c.insee='"+req.query.insee+"'\
              Group BY o.type";
    req.pgClient.query(sql, function(err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }
       
        if (!result.rows) {
            return res.status(404).send({
                status: 'No Data for your search'
            });
        }
        return res.send({
            type: 'FeatureCollection',
            features: result.rows.map(function(row) {
                return {
                    type: 'Feature',
                    properties: _.omit(row, 'geom')
                };
            })
        });
    });
};
