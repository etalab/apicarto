var codesPostaux = require('codes-postaux');


exports.communes = function handleCommuneRequest(req, res) {
    if (! req.params.codePostal.match(/\d{5}/))
        return res.sendStatus(400);

    var result = codesPostaux.find(req.params.codePostal);

    if (! result.length)
        return res.sendStatus(404);

    res.send(result);
};
