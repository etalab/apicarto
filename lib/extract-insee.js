'use strict';
const parseInsee = require('../lib/parse_insee');

module.exports = function (req, res, next) {
    if (req.query.insee) {
        try {
            req.codeInseeParts = parseInsee(req.query.insee);
            req.codeInsee = req.query.insee.toUpperCase();
        } catch (err) {
            return res.status(400).send({
                code: 400,
                message: err.message
            });
        }
    }
    next();
};
