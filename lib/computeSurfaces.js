/* En parametre nous avons :
 * GeomInit : Correspondant à la geométrie passé en paramètre
 * Parcelle : Resultat de la recherche avec Géométrie
 *
 */
var turf = require('@turf/turf');

var computeSurfaces = function(featureCollection, filterGeom){
    featureCollection.features.forEach(function(feature){
        /*
         * TODO :
         * - clarify units (test were inconsistents with code)
         */
        var intersect_polygon = turf.intersect(feature, filterGeom);
        feature.properties.surface_parcelle = (turf.area(feature)).toFixed(2);
        if ( typeof intersect_polygon === 'undefined' ){
            feature.properties.surface_intersection = 0.0;
        }else{
            feature.properties.surface_intersection = (turf.area(intersect_polygon)).toFixed(2);
        }
    });
    return featureCollection;
};

module.exports = computeSurfaces;
