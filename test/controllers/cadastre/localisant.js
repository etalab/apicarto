/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/localisant', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(server)
                    .get('/api/cadastre/localisant?code_insee=testapi&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/localisant?code_insee=94067&section=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid code_arr', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/localisant?code_insee=94067&code_arr=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid com_abs', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/localisant?code_insee=94067&com_abs=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

    });


if ( typeof API_KEY !== 'undefined' ){

    it('/api/cadastre/localisant?code_insee=94067', function(){
        request(server)
            .get('/api/cadastre/localisant?code_insee=94067&apikey='+API_KEY)
            .expect(200);
    });

    it('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141', done => {
        request(server)    
            .get('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141&apikey='+API_KEY)
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
                    code_arr: '000',
                    code_insee: '55001'
                });
            })
            .end(done);
    });

} // API_KEY is defined

});

