const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    var referer = 'http://localhost';

    /* forward du referer du client */
    if ( req.headers.referer ){
        referer = req.headers.referer ;
    }

    req.drealCorseWfsClient = new GeoportalWfsClient({
        'geometryFieldName': 'geom',
        'apiKey':  'geoserver',
        'url' : 'https://georchestra.ac-corse.fr/{apiKey}/wfs',
        'headers':{
            Referer: referer,
            'User-Agent': 'apicarto'
        }
    });
    next();
};
