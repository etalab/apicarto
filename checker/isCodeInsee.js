const parseInseeCode = require('../helper/parseInseeCode');

/**
 * Validation des codes insee
 * @param {String} value 
 */
module.exports = function(value){
    var inseeParts = parseInseeCode(value);
    return true;
};
