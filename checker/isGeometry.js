const geojsonhint = require('@mapbox/geojsonhint').hint;

/**
 * Validation des géométries geojson
 * @param {Object} value 
 */
module.exports = function(value){
    var errors = geojsonhint(value);
    if ( errors.length !== 0 ){
        var message = errors.map(error => error.message).join(', ');
        throw new Error(message);
    }
    return true;
};

