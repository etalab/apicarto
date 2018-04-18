const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    if (!req.query.apikey) {
        res.status(403).json({
            code: 403,
            message:'Le paramètre apikey est requis'
        });
    }

    var referer = req.headers.referer || 'http://localhost';

    req.gppWfsClient = new GeoportalWfsClient({
        "apiKey":  req.query.apikey,
        "url": 'http://wxs.ign.fr/{apiKey}/geoportail/wfs',
        "headers":{
            Referer: referer
        }
    });

    next();
};
