const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    var requestParams = ( req.method === 'GET' ) ? req.query : req.body ;

    if (! requestParams.apikey ) {
        res.status(403).json({
            code: 403,
            message:'Le paramètre apikey est requis'
        });
        return;
    }

    var referer = req.headers.referer || 'http://localhost';

    req.gppWfsClient = new GeoportalWfsClient({
        "apiKey":  requestParams.apikey,
        "url": 'http://wxs.ign.fr/{apiKey}/geoportail/wfs',
        "headers":{
            Referer: referer
        }
    });

    next();
};
