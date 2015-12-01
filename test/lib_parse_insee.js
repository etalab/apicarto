/*eslint-env node, mocha */
var test = require('unit.js');

var parse_insee = require('../lib/parse_insee.js') ;

describe('test du décode insee', function() {
    it('returns null for invalid INSEE code', function(){
        var result = parse_insee('5444');
        test.assert(null === result);
    });

    it('returns {code_dep:25, code_com:349} for 25349', function(){
        var result = parse_insee('25349');
        test.value(result.code_dep).isEqualTo('25');
        test.value(result.code_com).isEqualTo('349');
    });

    it('returns {code_dep:971, code_com:23} for 97123', function(){
        var result = parse_insee('97123');
        test.value(result.code_dep).isEqualTo('971');
        test.value(result.code_com).isEqualTo('23');
    });
});
