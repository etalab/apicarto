/*eslint-env node, mocha */
//var test = require('unit.js');
var geojson_intersect = require('../lib/geojson_intersection.js') ;
var CadastreClient = require('../lib/CadastreClient.js');

const geojsonhint = require('geojsonhint').hint;
const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');
const _ = require('lodash');

function returnValidGeoJSON(res) {
    expect(geojsonhint(res.body)).to.eql([]);
}


describe('test du module divisions', function() {
    
    describe('not valid input type', function() {
        it('should reply with 400 pour numero sur 2 caractères au lieu de 4', function(done){
		    request(server)
                .get('/cadastre/division?insee=94067&numero=02')
                .expect(400,done);
        });
        
        it('should reply with 400 pour chaine testapi', function(done){
		    request(server)
                .get('/cadastre/division?insee=testapi')
                .expect(400,done);
        });
     });
    describe('Test du module divisions avec valeur', function() {
        it('should work for insee 94067 et section=0A', function(){
            request(server)
                .get('/cadastre/division?insee=94067&section=0A')
                .expect(200);
        });
     });
});


