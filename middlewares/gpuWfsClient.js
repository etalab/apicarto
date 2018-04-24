const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    var referer = 'http://localhost/';
    req.gpuWfsClient = new GeoportalWfsClient({
        'apiKey':  '39wtxmgtn23okfbbs1al2lz3',
        'url' : 'http://wxs-gpu.mongeoportail.ign.fr/externe/39wtxmgtn23okfbbs1al2lz3/wfs/v',
        'headers':{
            Referer: referer
        }
    });
    next();
};
