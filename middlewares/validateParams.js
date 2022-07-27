const { validationResult } = require('express-validator');

/**
 * 
 * Middleware de validation des paramètres s'appuyant sur express-validator et uniformisant
 * les retours d'erreur dans l'API.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports = function(req,res,next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            'code': 400,
            'message': errors.mapped() 
        });
    }
    next();
};
