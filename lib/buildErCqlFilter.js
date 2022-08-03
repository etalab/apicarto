
const  WKT = require('@terraformer/wkt');
var flip = require('@turf/flip');

/*
 * WARNING: Despite the use of WGS84, you need to do a flip on the coordinates
 */

/**
 * Convert a bbox on array with 4 values
 */
function parseBoundingBox(bbox){
    if ( typeof bbox !== 'string' ){
        return bbox;
    }
    return bbox.replace(/'/g, '').split(',');
}

/**
 * Convert a bbox in cql_filter fragment
 */
function bboxToFilter(bbox){
    bbox = parseBoundingBox(bbox);
    var xmin = bbox[1];
    var ymin = bbox[0];
    var xmax = bbox[3];
    var ymax = bbox[2];
    return 'BBOX(the_geom,'+xmin+','+ymin+','+xmax+','+ymax+')' ;
}

/**
 * Build cql_filter parameter for GeoServer according to user params.
 *
 * @param {object} params
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {object} [params.bbox] search bbox intersecting the resulting features.
 * @param {string} [geomFieldName="the_geom"] name of the geometry column by default
 * @param {string} [geomDefaultCRS=constants.defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 * @returns {string}
 */
function buildErCqlFilter(params) {
  
    var parts = [] ;
    for ( var name in params ){
        // ignore _limit, _start, etc.
        if ( name.charAt(0) === '_' ){
            continue;
        }
        
        if ( name == 'bbox' ){
            parts.push(bboxToFilter(params['bbox'])) ;
        }else if ( name == 'geom' ){
            var geom = params[name] ;
            if ( typeof geom !== 'object' ){
                geom = JSON.parse(geom) ;
            }
            var wkt = WKT.geojsonToWKT(flip(geom));
            parts.push('INTERSECTS(the_geom,'+wkt+')');
        
        // Field_date sous la forme date_maj_deb;date_maj_fin, nous devons donc les separer pour la requete
        } else if (name == 'field_date'){
            var value_date = params[name].split(';');
            parts.push('updated_at AFTER '+ value_date[0]+' AND updated_at BEFORE '+ value_date[1]);

        } else if (name == 'field_publication_date'){
            var value_date_publication = params[name].split(';');
            parts.push('publication_date AFTER '+ value_date_publication[0]+' AND publication_date BEFORE '+ value_date_publication[1]);

        } else if (name == 'namepr') { //Traiter le cas du produit avec le parametre name
            parts.push(' name ILIKE \'%'+ params[name] + '%\' OR name_complement ILIKE \'%'+ params[name] + '%\'');
      
        } else if((name == 'has_geometry') && (params[name] ==false)){
            continue; //We do nothing when value has geometry = false to get all results.
        
        // Search in category
        } else if (name == 'category_id') {
            var valueCat = params[name].split(';');
            if(valueCat.length < 2) {
                parts.push(name+'=\''+ params[name]+'\'');
            } else {
                var chaineCategoryId = '';
                var chaineConnector = '';
                for (let i = 0; i < valueCat.length; i++) {
                    if(i == 0) { chaineConnector =''; } else { chaineConnector = ' OR ';}
                    chaineCategoryId = chaineCategoryId + chaineConnector  + ' category_id='+valueCat[i];
                }
                parts.push(chaineCategoryId);
            }     
        } else {
            parts.push(name+'=\''+ params[name]+'\'');
        }
    }
    if ( parts.length === 0 ){
        return null;
    }
    return parts.join(' and ') ;
}
module.exports = buildErCqlFilter;
