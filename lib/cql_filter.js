var WKT = require('terraformer-wkt-parser');
var turf = require('@turf/turf');
var truncate = require('@turf/truncate').default;

module.exports =  function(params){
    var parts = [] ;
    for ( var name in params ){
        if ( name == 'bbox' ){
            // hack (strange "'"  added around bbox)
            params[name] = params[name].replace(/'/g, '');
            parts.push(`BBOX(the_geom,${params[name]})`) ;
        }else if ( name == 'geom' ){
            var geom = params[name] ;
            var wkt = WKT.convert(turf.flip(truncate(geom, {coordinates: 2})));
            parts.push(`INTERSECTS(the_geom,${wkt})`);
        }else{
            parts.push(name+'='+ params[name]);
        }
    }
    return parts.join(' and ') ;
};
