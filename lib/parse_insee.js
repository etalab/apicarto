var parse_insee = function(insee){
    if ( insee.length !== 5 ) {
        return null ;
    }
    //Cas spécial pour la Corse
    if ( (insee.substr(0,2) == '2A') || (insee.substr(0,2) == '2B')) {
		return {
            code_dep: insee.substr(0,2),
            code_com: insee.substr(2,3)
        } ;
    } else { 
        //Erreur si nous n'avons pas 5 chiffres
        var regExpInsee = new RegExp("[0-9]{5}$");
        if((regExpInsee.test(insee))) {
            if ( insee.substr(0,2) == '97' ) {
                return {
                    code_dep: insee.substr(0,3),
                    code_com: insee.substr(3,2)
                } ;
            } else {
                return {
                    code_dep: insee.substr(0,2),
                    code_com: insee.substr(2,3)
                } ;
            };
        } else {
            return null;
        }
    };
}

module.exports = parse_insee;
