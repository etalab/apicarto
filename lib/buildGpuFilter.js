const  WKT = require('@terraformer/wkt');
var flip = require('@turf/flip');

const proj4 = require('proj4');
proj4.defs('EPSG:4326','+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:2154','+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:3857','+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');

const defaultCRS = 'urn:ogc:def:crs:EPSG::4326';
const meta = require('@turf/meta');
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
 * @param {string} [geomDefaultCRS=defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 * @returns {string}
 */
function buildGpuFilter(params, geomFieldName,geomDefaultCRS) {
    geomFieldName = geomFieldName || 'the_geom';
    geomDefaultCRS = geomDefaultCRS || defaultCRS;

    var parts = [];
    for (var name in params) {
        // ignore _limit, _start, etc.
        if (name.charAt(0) === '_') {
            continue;
        }
        
        if (name == 'bbox') {
            parts.push(bboxToFilter(params['bbox'], geomFieldName));
        } else if (name == 'geom') {
            var geom = params[name];
            if (typeof geom !== 'object') {
                geom = JSON.parse(geom);
            }
            if(geomDefaultCRS != defaultCRS) {
                const input = geom;

                const transform = proj4('EPSG:4326',geomDefaultCRS);

                meta.coordEach(input,function(c){
                    let newC = transform.forward(c);
                    c[0] = newC[0];
                    c[1] = newC[1];
                });
                geom=input;
            }
            var wkt = WKT.geojsonToWKT(flip(geom));
            parts.push('INTERSECTS( the_geom' + ',' + wkt + ')');
        } else {
            parts.push(name + '=\'' + params[name] + '\'');
        }
    }
    if (parts.length === 0) {
        return null;
    }
    return parts.join(' and ');
}


module.exports=buildGpuFilter;