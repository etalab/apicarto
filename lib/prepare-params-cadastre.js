'use strict';

const parseInseeCode = require('../lib/parse-insee-code');

/*
 * TODO rebaser sur express-validator
 */
module.exports = function (req, res, next) {
    var result = {} ;
    var requestParams = ( req.method === 'GET' ) ? req.query : req.body ;
    var path = req.path;
    for ( var name in requestParams ){
        switch(name) {
        case 'insee':
            try {
                var inseeParts = parseInseeCode(requestParams[name]);
                if (path === '/commune') {
                    result.code_insee = requestParams[name];
                } else {
                    result.code_dep = inseeParts.code_dep;
                    result.code_com = inseeParts.code_com;
                }
            }catch(e){
                return res.status(400).send({
                    code: 400,
                    message: e
                });
            }
            break;
        case 'geom':
            result.geom = requestParams[name];
            break;
        case 'the_geom': //Syntaxe GPU
            result.geom = requestParams[name];
            break;
        case 'section':
            if(requestParams[name].length == 2) {
                result.section = requestParams[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de section est sur 2 caractères'
                });
            }
            break;
        case 'numero':
            if(requestParams[name].length == 4) {
                result.numero =requestParams[name];
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de parcelle est sur 4 caractères'
                });
            }
            break;
        case 'codearr': // Pour traiter le cas des arrondissements
            if((requestParams[name].length == 3) && (requestParams[name].match(/[0-9]{2}/)))  {
                result.code_arr = requestParams[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le code arrondissement est composé de 3 chiffres'
                });
            }
            break;
        case 'dep':
            if((requestParams[name].length == 3) || (requestParams[name].length == 2)) {
                result.code_dep = requestParams[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de département est composé de 2 caractères ou 3 caractères(DOM)'
                });
            }
            break;
        case 'nom_com':
            result.nom_com = requestParams[name] ;
            break;
            
        case 'com_abs': // Pour traiter le cas des communes rattachés et parcelles identiques
            if((requestParams[name].length == 3) && (requestParams[name].match(/[0-9]{2}/)))  {
                result.com_abs= requestParams[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le prefixe est composé de 3 chiffres obligatoires'
                });
            }
            break;
        case 'apikey':
            break;
        default:
            return res.status(400).send({
                code: 400,
                message:'Un ou plusieurs paramètres sont inconnus'
            });
        }
        
    }
    req.cadastreParams = result;
    next();
};
