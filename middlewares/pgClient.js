const debug = require('debug')('apicarto');
const Client = require('pg').Client;

/*
 * middleware pour la création et la libération des connexions postgresql
 */
module.exports = function(req, res, next) {
    debug("create pg connection...");
    req.pgClient = new Client({
        user: process.env.PGUSER|| 'postgis',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD || 'postgis',
        port: process.env.PGPORT || 'postgis'
    });
    req.pgClient.connect().then(function(){
        var _end = res.end; 
        res.end = function(){
            debug("close connection...");
            req.pgClient.end();
            _end.apply(this, arguments); 
        };        
        next();
    }).catch(function(err){
        console.log(err);
        res.status(500).json({
            'code': 500,
            'message': 'Erreur de la connexion à la base de données'
        });
    });
};
