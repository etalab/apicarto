var parse_insee = require('./parse_insee');

module.exports =  function(query){
    var result = {} ;

    for ( var name in query ){
        if ( name == 'insee' ){
            var inseeParts = parse_insee(query[name]) ;
            if ( null !== inseeParts ){
                result.code_dep = '\'' + inseeParts.code_dep + '\'';
                result.code_com = '\'' + inseeParts.code_com + '\'';
            }
        } else if (name == 'geom') {
            result.geom = '\''+query[name]+'\'';
        } else {
            result[name] = '\''+query[name]+'\'' ;
        }
    } /* } else if ( name == 'section') {
             if (query[name].length !==2) {
                 result.section = null;
             } else {
                 result.section = query[name];
             }*/
        /*} else if (name == 'numero') {
             if (query[name].length !==4) {
                 result.numero = null;
             } else {
                 result.numero = query[name];
             }*/
    return result ;
};
