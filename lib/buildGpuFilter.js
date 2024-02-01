
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
 * @returns {string}
 */
function buildCqlFilter(params) {
    geomFieldName = geomFieldName || constants.defaultGeomFieldName;

    var parts = [];
    for (var name in params) {
        // ignore _limit, _start, etc.
        if ('_' === name.charAt(0)) {
            continue;
        }

        if ('bbox' == name) {
            parts.push(bboxToFilter(params['bbox'], geomFieldName));
        } else if ('geom' == name) {
            var geom = params[name];
            if ('object' !== typeof geom) {
                geom = JSON.parse(geom);
            }
            if(geomDefaultCRS != constants.defaultCRS) {
                const input = geom;

                const transform = proj4('EPSG:4326',geomDefaultCRS);

                coordEach(input,function(c){
                    let newC = transform.forward(c);
                    c[0] = newC[0];
                    c[1] = newC[1];
                });
                geom=input;
            }
            // flip coordinate as EPSG:4326 is lat,lon for GeoServer
            if (geomDefaultCRS == constants.defaultCRS) {
                geom = flip(geom);
            }
            let wkt = WKT.convert(geom);
            parts.push('INTERSECTS(' + geomFieldName + ',' + wkt + ')');
        } else {
            parts.push(name + '=\'' + params[name] + '\'');
        }
    }
    if (0 === parts.length) {
        return null;
    }
    return parts.join(' and ');
}
module.exports = buildErCqlFilter;
