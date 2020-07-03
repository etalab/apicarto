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

    req.erWfsClient = new GeoportalWfsClient({
        apiKey:  process.env.GEOPORTAL_API_KEY,
        'url' : 'https://qlf-wxs-v.geo.rie.gouv.fr/geoportail/wfs',
        'headers':{
            Referer: referer,
            'User-Agent': 'apicarto'
        }
    });
    next();
};
