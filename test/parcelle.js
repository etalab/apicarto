/*eslint-env node, mocha */
//var test = require('unit.js');

const request = require('supertest');
const server = require('../server');
//const expect = require('expect.js');


describe('test du module parcelle', function() {
    
    describe('not valid input type', function() {
        it('should reply with 400 pour chaine testapi', function(done){
            request(server)
                .get('/cadastre/parcelle?insee=testapi')
                .expect(400,done);
        });
    });
    describe('Test du module parcelles avec valeur', function() {
        it('should work for insee 94067 et section=0A', function(){
            request(server)
                .get('/cadastre/parcelle?insee=94067&section=0A')
                .expect(200);
        });
    });
    describe('Test du module parcelles avec valeur', function() {
        it('should work for insee 33290 et section=0A et numero=0112 et com_abs=410', function(){
            request(server)
                .get('/cadastre/parcelle?insee=94067&section=0A&numero=0112&com_abs=410')
                .expect(200);
        });
    });
});



