/*eslint-env node, mocha */
//var test = require('unit.js');

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
        it('should reply a FeatureCollection containing a valid Feature', done => {
            request(server)    
                .get('/cadastre/localisant?insee=55001&section=ZK')
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('Point');
                    expect(feature.properties).to.eql({
                        numero: '0141',
                        feuille: 1,
                        section: 'ZK',
                        code_dep: '55',
                        nom_com: 'Abainville',
                        code_com: '001',
                        com_abs: '000',
                        code_arr: '000' 
                    });
                })
                .end(done);
        });
    });
});

