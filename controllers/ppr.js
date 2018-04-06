var format = require('pg-format');
var _ = require('lodash');
var Handlebars = require('handlebars');


var inQuery = Handlebars.compile(`
	SELECT 
		ST_area( t.geom ),
		ST_AsGeoJSON( ST_Intersection(t.geom, d.geom) ) as intersection,
		t.id_map as map,
		t.id_gaspar as idgaspar,
		t.nom as nom,
		t.etat as etat,
		t.dateappro as dateappro,
		t.datefinval as datefinval,
		t.multi_risq as multi_risq,
		t.coderisque as coderisque,
		t.nomrisque as nomrisque,
		t.site_web as site_web,
		t.uri_gaspar as uri_gaspar
		
	FROM (
		SELECT ST_SetSRID(
			ST_GeomFromGeoJSON('%s'),
			4326
		) as geom
	) d
	INNER JOIN ial_document t 
		ON ST_Intersects(t.geom,d.geom);
`);

function buildSQLQueryDepartement(departement) {
	
    var query = "SELECT t.id_map as idmap,\
		t.id_gaspar as idgaspar,\
		t.nom as nom,\
		t.etat as etat,\
		t.dateappro as dateappro,\
		t.datefinval as datefinval,\
		t.multi_risq as multi_risq,\
		t.coderisque as coderisque,\
		t.nomrisque as nomrisque,\
		t.site_web as site_web,\
		t.uri_gaspar as uri_gaspar,\
		ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom \
		FROM ial_document t \
		WHERE t.id_gaspar like '"+departement+"%'";
    return query;
}


function buildSQLQuery(options) {
    var queryResult = format(inQuery(options), options.geometry);
    console.log(queryResult);
    return queryResult;
}
exports.in = function(req, res, next) {
    if (!req.body.geom) {
        res.sendStatus(400);
        return next();
    }
    req.pgClient.query(buildSQLQuery({
        geometry: req.body.geom.geometry,
        withGeometries: req.body.geojson !== false
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
                    geometry: JSON.parse(row.intersection),
                    properties: _.omit(row, 'geom')
                };


                return feature;
            })
        });
    });
};

exports.secteur = function(req, res, next) {
   
    var departement= req.query.numDepartement;
    var sql = buildSQLQueryDepartement(departement);
    req.pgClient.query(sql, function(err, result) {
        if (err) {
            req.pgEnd(err);
            return next(err);
        }
        if (!result.rows[0]) {
            return res.status(404).send({ status: 'Aucune donnée disponible sur le département '+departement });
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
                  

                return feature;
            })
        });
    });
};
