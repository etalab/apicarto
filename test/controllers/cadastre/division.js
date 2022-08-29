/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');


describe('Testing /api/cadastre/division', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(app)
                    .get('/api/cadastre/division?code_insee=testapi')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/division?code_insee=94067&section=invalid')
                    .expect(400,done);
            });
        });

    });

    describe('/api/cadastre/division?code_insee=94067&section=0A', function() {
        it('should reply a FeatureCollection containing a valid Feature for insee=94067 and section=0A', done => {
            request(app)
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
                        bbox: [2.41596,48.8463411,2.4189352,48.8493916],
                        code_insee: '94067',
                        code_arr: '000',
                    });
                })
                .end(done);
        });
    });

    describe('/api/cadastre/division?code_insee=75056&code_arr=112&section=AA', function() {
        it('should reply a FeatureCollection containing a valid Feature for case Paris 12e', done => {
            request(app)
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
                        edition: 1,
                        code_arr: '112',
                        bbox: [2.39897142,48.84503372,2.40345206,48.84809772],
                        code_insee: '75056'
                    });
                })
                .end(done);
        });
    });

});
