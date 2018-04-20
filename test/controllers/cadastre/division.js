/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/division', function() {

    describe('/api/cadastre/division - invalid inputs', function() {
        this.timeout(5000);
        it('should reply with 400 for numero=02 (4 chars expected)', function(done){
            request(server)
                .get('/api/cadastre/division?insee=94067&numero=02&apikey=fake')
                .expect(400,done);
        });

        it('should reply with 400 for insee=testapi', function(done){
            request(server)
                .get('/api/cadastre/division?insee=testapi&apikey=fake')
                .expect(400,done);
        });
    });

if ( typeof API_KEY !== 'undefined' ){

    describe('test /api/cadastre/division - valid inputs', function() {
        this.timeout(5000);
        it('should work for insee=94067 et section=0A', done => {
            request(server)
                .get('/api/cadastre/division?insee=94067&section=0A&apikey='+API_KEY)
                .expect(200, done);
        });
        it('should reply a FeatureCollection containing a valid Feature for insee=94067 and section=0A', done => {
            request(server)
                .get('/api/cadastre/division?insee=94067&section=0A&apikey='+API_KEY)
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
                        code_arr: '000'
                    });
                })
                .end(done);
        });
        it('should reply a FeatureCollection containing a valid Feature for case Paris 12e', done => {
            request(server)
                .get('/api/cadastre/division?insee=75056&codearr=112&section=AA&apikey='+API_KEY)
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
                        code_arr: '112'
                    });
                })
                .end(done);
        });
    });

} // API_KEY is defined

});
