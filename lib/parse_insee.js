var parse_insee = function(insee){
    if ( insee.length !== 5 ) {
        return null ;
    }
    if ( insee.substr(0,2) == '97' ){
        return {
            code_dep: insee.substr(0,3),
            code_com: insee.substr(3,2)
        } ;
    } else {
        return {
            code_dep: insee.substr(0,2),
            code_com: insee.substr(2,3)
        } ;
    }
};

module.exports = parse_insee;
