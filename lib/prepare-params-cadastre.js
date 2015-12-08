var parse_insee = require('../lib/parse_insee');

module.exports= function (req,res) {
    var result = {} ;
    var query = req.query;
    var path = req.path;
    for ( var name in query ){
        switch(name) {
        case 'insee':
            var inseeParts = parse_insee(query[name]);
            if ( null !== inseeParts ){
                if(path =='/commune') {
                    result.code_insee = '\''+query[name]+'\'';
                } else {
                    result.code_dep = '\'' + inseeParts.code_dep + '\'';
                    result.code_com = '\'' + inseeParts.code_com + '\'';
                }   
            } else {
                return res.status(400).send({ code: 400, message:'Le code insee (champ obligatoire) est sur 5 caractères de type chiffre sauf pour la Corse qui commence par 2A ou 2B' });
            }
            break;
        case 'geom':
            result.geom = '\''+query[name]+'\'';
            break;
        case 'section':
            if(query[name].length == 2) {
                result.section =  '\''+query[name]+'\'' ;
            } else {
                return res.status(400).send({ code: 400, message:'Le numéro de section est sur 2 caractères' });
            } 
            break;
        case 'numero':
            if(query[name].length == 4) {
                result.numero =  '\''+query[name]+'\'' ;
            } else {
                return res.status(400).send({ code: 400, message:'Le numéro de parcelle est sur 4 caractères' });
            }
            break;
        default:
            return res.status(400).send({code: 400, message:'Un ou plusieurs paramètres sont inconnus' });
        }
    } 
    return result;
};

