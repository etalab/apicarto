const geojsonhint = require('@mapbox/geojsonhint').hint;

/**
 * 
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

