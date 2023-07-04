var Router = require('express').Router;
var router = new Router();
var format = require('pg-format');

var pgClient = require('../../middlewares/pgClient');

/**
 * Contrôle de l'accès à la BDD
 */
router.get('/db', pgClient, function(req, res, next) {
    var sql = format('SELECT * FROM pg_stat_activity LIMIT 1');
    req.pgClient.query(sql,function(err,result){  
        if(result) return res.status(200).send({status: 'success'});
        if (err) return next(err);
    });
});

module.exports = router;
