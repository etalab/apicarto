'use strict';

module.exports = function (req, res, next) {
    var result = {} ;
    var query = req.query;
    var path = req.path;
    for ( var name in query ){
        switch(name) {
        case 'insee':
            var inseeParts = req.codeInseeParts;
            if (path === '/commune') {
                result.code_insee = '\''+query[name]+'\'';
            } else {
                /*result.code_dep = '\'' + inseeParts.code_dep + '\'';
                result.code_com = '\'' + inseeParts.code_com + '\'';*/
                 result.code_dep = inseeParts.code_dep;
                result.code_com = inseeParts.code_com;
            }
            break;
        case 'geom':
            result.geom = '\''+query[name]+'\'';
            break;
         case 'the_geom': //Syntaxe GPU
            result.geom = '\''+query[name]+'\'';
            break;
        case 'section':
            if(query[name].length == 2) {
                result.section = query[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de section est sur 2 caractères'
                });
            }
            break;
        case 'numero':
            if(query[name].length == 4) {
                result.numero =query[name];
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de parcelle est sur 4 caractères'
                });
            }
            break;
        case 'codearr': // Pour traiter le cas des arrondissements
            if((query[name].length == 3) && (query[name].match(/[0-9]{2}/)))  {
                result.code_arr = query[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le code arrondissement est composé de 3 chiffres'
                });
            }
            break;
        case 'dep':
            if((query[name].length == 3) || (query[name].length == 2)) {
                result.code_dep = query[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le numéro de département est composé de 2 caractères ou 3 caractères(DOM)'
                });
            }
            break;
        case 'nom_com':
            result.nom_com = '\''+query[name]+'\'' ;
            break;
            
        case 'com_abs': // Pour traiter le cas des communes rattachés et parcelles identiques
            if((query[name].length == 3) && (query[name].match(/[0-9]{2}/)))  {
                result.com_abs= query[name] ;
            } else {
                return res.status(400).send({
                    code: 400,
                    message:'Le prefixe est composé de 3 chiffres obligatoires'
                });
            }
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


