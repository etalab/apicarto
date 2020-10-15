const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');


/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
module.exports = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        apiKey:  '',
        url: 'https://georchestra.ac-corse.fr/geoserver/wfs?',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };


    /* gestion du paramètre Referer */
    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
    if ( process.env.GEOPORTAL_REFERER && ! hasUserKey ){
        options.headers.Referer = process.env.GEOPORTAL_REFERER ;
    }

    /* contrôle définition apikey */
    if ( ! options.apiKey ) {
        return res.status(403).json({
            code: 403,
            message:'Le paramètre apikey est requis'
        });
    }

    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};
