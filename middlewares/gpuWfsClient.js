const debug = require('debug')('apicarto');
const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * middleware pour la création du client geoportail
 */
module.exports = function(req, res, next) {
    var referer = 'apicarto.ign.fr';

    /* forward du referer du client */
    if ( req.headers.referer ){
		console.log('je suis dans if');
        referer = req.headers.referer ;
    }

    req.gpuWfsClient = new GeoportalWfsClient({
        'apiKey':  '39wtxmgtn23okfbbs1al2lz3',
        'url' : 'http://wxs-gpu.mongeoportail.ign.fr/externe/39wtxmgtn23okfbbs1al2lz3/wfs/v',
        'headers':{
            Referer: referer,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            //'Access-Control-Allow-Headers': "Origin, X-Requested-With, Content-Type, Accept",
            //'Access-Control-Allow-Methods': 'GET,POST',
            'P3P' : CP="ALL IND DSP COR ADM CONo CUR CUSo IVAo IVDo PSA PSD TAI TELo OUR SAMo CNT COM INT NAV ONL PHY PRE PUR UNI",
            'User-Agent': 'apicarto'
        }
    });
    next();
};
