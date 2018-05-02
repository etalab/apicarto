# Comment calculer la surface des parcelles et la surface d'intersection avec la géométrie en entrée?

Avec `geom` la géométrie de recherche des parcelles et `featureCollection` le résultat de l'appel à l'API `/api/cadastre/parcelle`, il suffit de procéder comme suit à l'aide de turfjs :

```javascript
/* pour chaque feature... */
featureCollection.features.forEach(function(feature){
    // on calcule la surface de la parcelle...
    feature.properties.surface = turf.area(feature);

    // on calcule l'intersection géométrique...
    var intersection = turf.intersect(feature, geom);
    // puis la surface de l'intersection
    if ( typeof intersection === 'undefined' ){
        feature.properties.surface_intersection = 0.0;
    }else{
        feature.properties.surface_intersection = (turf.area(intersection)).toFixed(2);
    }
});
```

Voir :

* http://turfjs.org/docs#area
* http://turfjs.org/docs#intersect
