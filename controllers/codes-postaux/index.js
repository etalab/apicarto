var Router = require('express').Router;
var router = new Router();

/* import data package */
var codesPostaux = require('codes-postaux');

router.get('/communes/:codePostal', function (req, res) {
    if (! req.params.codePostal.match(/^\d{5}$/))
        return res.sendStatus(400);

    var result = codesPostaux.find(req.params.codePostal);

    if (! result.length)
        return res.sendStatus(404);

    res.json(result);
});

module.exports=router;
