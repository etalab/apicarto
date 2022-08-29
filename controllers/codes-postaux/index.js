const Router = require('express').Router;
var router = new Router();

const { check } = require('express-validator');
const { matchedData } = require('express-validator');

const validateParams = require('../../middlewares/validateParams');

/* import data package */
const codesPostaux = require('codes-postaux');

router.get('/communes/:codePostal', [
    check('codePostal').matches(/^\d{5}$/).withMessage('Code postal invalide')
], validateParams, function (req, res) {
    const filter = matchedData(req);
    var result = codesPostaux.find(filter.codePostal);
    if (! result.length){
        return res.sendStatus(404);
    }
    res.json(result);
});

module.exports=router;
