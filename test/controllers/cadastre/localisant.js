/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');

describe('Testing /api/cadastre/localisant', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=testapi')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&section=invalid')
                    .expect(400,done);
            });
        });

        describe('With invalid code_arr', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&code_arr=invalid')
                    .expect(400,done);
            });
        });

        describe('With invalid com_abs', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&com_abs=invalid')
                    .expect(400,done);
            });
        });

    });


    it('/api/cadastre/localisant?code_insee=94067', function(){
        request(app)
            .get('/api/cadastre/localisant?code_insee=94067')
            .expect(200);
    });

    it('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141', done => {
        request(app)    
            .get('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141')
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
                    idu: "55001000ZK0141",
                    bbox:[5.50374285,48.52731102,5.50374285,48.52731102],
                    code_insee: '55001'
                });
            })
            .end(done);
    });
});

