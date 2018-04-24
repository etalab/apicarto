var Router = require('express').Router;
var router = new Router();

router.get('/communes/:codePostal', require('./communes'));

module.exports=router;
