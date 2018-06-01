/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/division', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(server)
                    .get('/api/cadastre/division?code_insee=testapi')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/division?code_insee=94067&section=invalid')
                    .expect(400,done);
            });
        });

    });

if ( typeof API_KEY !== 'undefined' ){

    describe('/api/cadastre/division?code_insee=94067&section=0A', function() {
        this.timeout(5000);
        it('should reply a FeatureCollection containing a valid Feature for insee=94067 and section=0A', done => {
            request(server)
                .get('/api/cadastre/division?code_insee=94067&section=0A')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        feuille: 1,
                        section: '0A',
                        code_dep: '94',
                        nom_com: 'Saint-Mandé',
                        code_com: '067',
                        com_abs: '000',
                        echelle: '500',
                        edition: 3,
                        code_arr: '000',
                        code_insee: '94067'
                    });
                })
                .end(done);
        });
    });

    describe('/api/cadastre/division?code_insee=75056&code_arr=112&section=AA', function() {
        it('should reply a FeatureCollection containing a valid Feature for case Paris 12e', done => {
            request(server)
                .get('/api/cadastre/division?code_insee=75056&code_arr=112&section=AA')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        feuille: 1,
                        section: 'AA',
                        code_dep: '75',
                        nom_com: 'Paris',
                        code_com: '056',
                        com_abs: '000',
                        echelle: '500',
                        edition: 3,
                        code_arr: '112',
                        code_insee: '75056'
                    });
                })
                .end(done);
        });
    });

} // API_KEY is defined

});
