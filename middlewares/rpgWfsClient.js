const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
module.exports = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        apiKey: 'agriculture',
        url: 'https://wxs.ign.fr/{apiKey}/geoportail/wfs',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };

    /* gestion du paramètre Referer */
    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};
