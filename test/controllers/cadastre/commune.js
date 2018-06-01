/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');
const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/commune', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/commune?code_insee=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

if ( typeof API_KEY !== 'undefined' ){

    /* filtrage par code insee */
    describe('/api/cadastre/commune?code_insee=55001',function(){
        it('should reply a FeatureCollection with a valid feature', done => {
            request(server)    
                .get('/api/cadastre/commune?code_insee=55001')
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        nom_com: 'Abainville',
                        code_dep: '55',
                        code_insee: '55001'
                    });
                })
                .end(done);
        });
    });

    /* filtrage par code_dep */
    describe('/api/cadastre/commune?code_dep=94',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(server)    
                .get('/api/cadastre/commune?code_dep=94')
                .expect(200)
                .expect(res => {
                    const features = res.body.features;
                    expect(features.length).to.be.greaterThan(5);
                })
                .end(done)
            ;
        });
    });


    describe('/api/cadastre/commune?code_dep=94&nom_com=Vincennes',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(server)    
                .get('/api/cadastre/commune?code_dep=94&nom_com=Vincennes')
                .expect(200)
                .expect(res => {
                    expect(res.body.type).to.eql('FeatureCollection');
                     const feature = res.body.features[0];
                     expect(feature.geometry.type).to.eql('MultiPolygon');
                     expect(feature.properties).to.eql({
                         nom_com: 'Vincennes',
                         code_dep: '94',
                         code_insee: '94080'
                     });
                 })
                .end(done)
            ;
        });
    });

    describe('/api/cadastre/commune?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(server)
            .post('/api/cadastre/commune')
            .expect(200)
            .send({ 'geom': {'type':'Point','coordinates':[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        code_dep: '07',
                        nom_com: 'Andance',
                        code_insee: '07009'
                    });
                })
             .end(done);
        });
    });

} // API_KEY is defined
    
});
