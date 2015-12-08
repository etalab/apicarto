var WKT = require('terraformer-wkt-parser');
var util = require('util');
var turf = require('turf');

module.exports =  function(params){
    var parts = [] ;
    for ( var name in params ){
        if ( name == 'bbox' ){
            // hack (strange "'"  added around bbox)
            params[name] = params[name].replace(/'/g, '');
            parts.push( 'BBOX(the_geom,'+params[name]+')' ) ;
        }else if ( name == 'geom' ){
            var geom = params[name] ;
            var wkt = WKT.convert(turf.flip(geom));
            parts.push( util.format('INTERSECTS(the_geom,%s)',wkt) );
        }else{
            parts.push(name+'='+ params[name]);
        }
    }
    return parts.join(' and ') ;
};
