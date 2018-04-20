/*eslint-env node, mocha */

const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/localisant', function() {

    it('should reply with 400 for insee=testapi', function(done){
        request(server)
            .get('/api/cadastre/localisant?insee=testapi&apikey=fake')
            .expect(400,done);
    });

if ( typeof API_KEY !== 'undefined' ){

    it('should work for insee 55001', function(){
        request(server)
            .get('/api/cadastre/localisant?insee=94067&apikey='+API_KEY)
            .expect(200);
    });

    it('should reply a FeatureCollection containing a valid Feature', done => {
        request(server)    
            .get('/api/cadastre/localisant?insee=55001&section=ZK&numero=0141&apikey='+API_KEY)
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

} // API_KEY is defined

});

