/*eslint-env node, mocha */
//var test = require('unit.js');

const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');


describe('test du module commune  ', function() {
    
    describe('not valid input type', function() {
        it('should reply with 400', function(done){
            request(server)
                .get('/cadastre/commune?insee=testapi')
                .expect(400,done);
        });
    });
    describe('Test du module commune avec valeur', function() {
        it('should work for insee 94067', function(){
            request(server)
                .get('/cadastre/commune?insee=94067')
                .expect(200);
        });
        it('should reply a FeatureCollection containing a valid Feature', done => {
            request(server)    
                .get('/cadastre/commune?insee=55001')
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
        it('should reply a FeatureCollection containing a valid Feature', done => {
            request(server)    
                .get('/cadastre/commune?insee=55001')
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
    
    describe('Test du module commune avec valeur', function() {
        it('should work for insee 94067', function(){
            request(server)
                .get('/cadastre/commune?insee=94067')
                .expect(200);
        });
        it('should reply a FeatureCollection containing a valid Feature', done => {
            request(server)    
                .get('/cadastre/commune?insee=55001')
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
         it('should work for dep 94 ', done => {
            request(server)    
                .get('/cadastre/commune?dep=94')
                 .expect(200);
        });
        it('should work for dep 94 and nom_com Vincennes : Return FeatureCollection', done => {
            request(server)    
                .get('/cadastre/commune?dep=94&nom_com=Vincennes')
               .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        nom_com: 'Vincennes',
                        code_dep: '94',
                        code_insee: '94080'
                    });
                })
                .end(done);
        });
       /*it('should work for Paris 12e : Return FeatureCollection', done => {
            request(server)    
                .get('/cadastre/commune?insee=75056&prefixe')
               .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        nom_com: 'Vincennes',
                        code_dep: '94',
                        code_insee: '94080'
                    });
                })
                .end(done);
        });*/
    });
});

