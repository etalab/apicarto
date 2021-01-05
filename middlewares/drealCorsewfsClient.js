const debug = require('debug')('apicarto');
const fluxExterneCorse= require('../lib/ClientDreal.js');


/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
module.exports = function(req, res, next) {
    var referer = 'http://localhost';

    /* forward du referer du client */
    if ( req.headers.referer ){
        referer = req.headers.referer ;
    }
console.log("je suis dans wfs client");
    req.drealCorsewfsClient = new fluxExterneCorse({
        'url' : 'https://georchestra.ac-corse.fr/geoserver/wfs',
        'headers':{
            Referer: referer,
            'User-Agent': 'apicarto'
        }
    });
    next();
};
