const parseInseeCode = require('../lib/parse-insee-code');

/**
 * Validation des codes insee
 * @param {String} value 
 */
module.exports = function(value){
    var inseeParts = parseInseeCode(value);
    return true;
};
