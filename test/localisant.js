/*eslint-env node, mocha */
//var test = require('unit.js');
var geojson_intersect = require('../lib/geojson_intersection.js') ;
var CadastreClient = require('../lib/CadastreClient.js');

const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');


describe('test du module localisant  ', function() {
    
    describe('not valid input type', function() {
        it('should reply with 400', function(done){
		    request(server)
                .get('/cadastre/localisant?insee=testapi')
                .expect(400,done);
        });
     });
    describe('Test du module localisant avec valeur', function() {
		it('should work for insee 55001', function(){
            request(server)
                .get('/cadastre/localisant?insee=94067')
                .expect(200);
        });
     });
});

