/* En parametre nous avons :
 * GeomInit : Correspondant à la geométrie passé en paramètre
 * Parcelle : Resultat de la recherche avec Géométrie
 *
 */
var turf = require('turf');

var geojson_intersection = function(parcelle, geomInit){
    var parcellePolygon = {
        'type': 'Feature',
        'geometry':{
            'type':'Polygon',
            'coordinates' : parcelle.geometry.coordinates[0]
        }
    };
    var intersect_polygon = turf.intersect(parcellePolygon, geomInit);  
    var surface_intersection;
    if (typeof intersect_polygon == 'undefined' ) { 
        surface_intersection = 0;
    } else {
        surface_intersection = (turf.area(intersect_polygon)/ 10000).toFixed(4);
    }
    return surface_intersection;
};

module.exports = geojson_intersection;
