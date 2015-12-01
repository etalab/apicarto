var parse_insee = require('./parse_insee');
/* typeModule : permet de gerer les différents cas de retour pour insee*/

module.exports =  function(query,typeModule){
    var result = {} ;

    for ( var name in query ){
		if ( name == 'insee' ){
            var inseeParts = parse_insee(query[name]) ;
            if ( null !== inseeParts ){
				if(typeModule =='commune') {
					result.code_insee = '\''+query[name]+'\'';;
				} else {
                    result.code_dep = '\'' + inseeParts.code_dep + '\'';
                    result.code_com = '\'' + inseeParts.code_com + '\'';
                }   
            } else {
				return "ErreurInsee";
			}
        } else if (name == 'geom') {
            result.geom = '\''+query[name]+'\'';
        } else {
            result[name] = '\''+query[name]+'\'' ;
        }
    } 
    return result ;
};
