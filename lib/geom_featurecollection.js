/* Retourne un resultat FeatureCollection
 * Recois en paramètre une geometrie
 */
var turf = require('turf');
var geojson_intersect = require('./geojson_intersection.js') ;
function FeatureCollection() {
    this.type = 'FeatureCollection';
    this.features = new Array();
}

function geom_featureCollection(parcelles, paramGeom){
    var featureCollection = new FeatureCollection();
    for (var i = 0, len = parcelles.features.length; i < len; i++) {
        var parcelle = parcelles.features[i];
        //Calcul Intersection

        var surface_intersect = geojson_intersect(parcelle, paramGeom);
        featureCollection.features[i] = {
            type: 'Feature',
            geometry: parcelle.geometry,
            properties: {
                surface_intersection: surface_intersect,
                surface_parcelle: turf.area(parcelle),
                numero: parcelle.properties.numero,
                feuille: parcelle.properties.feuille,
                section: parcelle.properties.section,
                code_dep: parcelle.properties.code_dep,
                nom_com: parcelle.properties.nom_com,
                code_com: parcelle.properties.code_com,
                code_arr: parcelle.properties.code_arr
            }
        };
    }
    return featureCollection;
}


module.exports = geom_featureCollection ;
