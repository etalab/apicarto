var turf = require('@turf/turf');

/**
 * Ajout de surface_parcelle et surface_intersection
 * 
 * @deprecated anciennement utilisée sur POST /cadastre/geometrie
 * 
 * TODO : A réintegrer ou supprimer (c'est assez trivial à faire côté client et assez métier)
 * 
 * @param {Object} featureCollection la FeatureCollection en entrée
 * @param {Object} filterGeom la géométrie GeoJSON servant de test
 */
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
