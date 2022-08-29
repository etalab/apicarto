const GeoportalWfsClient = require('geoportal-wfs-client');
const readline = require('readline');
const fs = require('fs');
var fileSearchKey = './middlewares/ressources_cle_wfs2022-05-20.csv';

function readFileKeys(path){
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false
        });

        let lines = [];
        rl.on('line', (line) => {
            lines.push(line);
        });

        rl.on('close', () => {
            resolve(lines);
        });
    });
}

var linesKey =[];
readFileKeys(fileSearchKey).then(function(result){
    linesKey = result;
});

/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
module.exports = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        apiKey:  process.env.GEOPORTAL_API_KEY,
        url: 'https://wxs.ign.fr/{apiKey}/geoportail/wfs',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };
   
    var recupKey = '';
    let searchKeyIndice = -1;
    let i=0;
    let lineSplit='';
    // Recherche de la clé
    while (searchKeyIndice < 0) {
        lineSplit = linesKey[i].split(';');
        if (lineSplit[3] == req.query.source) {
            searchKeyIndice = 1;
            recupKey = lineSplit[1];
        } else {
            i = i + 1;
        }
    }
    /* gestion paramètre apikey */
    var hasUserKey = false;
    if ( recupKey ){
        options.apiKey = recupKey;
        hasUserKey = true;
    }

    /* gestion du paramètre Referer */
    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
    if ( process.env.GEOPORTAL_REFERER && ! hasUserKey ){
        options.headers.Referer = process.env.GEOPORTAL_REFERER ;
    }
    
    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};
