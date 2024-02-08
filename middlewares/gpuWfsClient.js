const GeoportalWfsClientGpu = require('../lib/ClientGpu.js');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    var referer = 'http://localhost';

    /* forward du referer du client */
    if ( req.headers.referer ){
        referer = req.headers.referer ;
    }

    req.gpuWfsClient = new GeoportalWfsClientGpu({
        'apiKey':  '39wtxmgtn23okfbbs1al2lz3',
        'url' : 'https://wxs-gpu.mongeoportail.ign.fr/externe/{apiKey}/wfs/v',
        'headers':{
            Referer: referer,
            'User-Agent': 'apicarto'
        }
    });
    next();
};
