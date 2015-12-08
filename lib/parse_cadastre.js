/* Nous verifons les champs :
 * section sur 2 caractères
 * numero sur 4 caractères
 * 
 */

var parse_cadastre = function(cadastre,name){
    var value;
    if (name == 'section') {
        value = 2;
    } else {
        value = 4;
    }
    // console.log(name);console.log(value);
    if ( cadastre.length !== value ){
        return null ;
    } 
    return { name: cadastre };
};

module.exports = parse_cadastre ;
