/*eslint-env node, mocha */
//var test = require('unit.js');

//const geojsonhint = require('geojsonhint').hint;
const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');


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
        it('should reply a FeatureCollection containing a valid Feature', done => {
            request(server)    
                .get('/cadastre/division?insee=94067&section=0A')
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
    });
});


