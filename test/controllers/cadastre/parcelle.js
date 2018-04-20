/*eslint-env node, mocha */

const request = require('supertest');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/parcelle', function() {
    this.timeout(5000);
    it('should reply with 400 for invalid insee', function(done){
        request(server)
            .get('/api/cadastre/parcelle?insee=testapi&apikey=fake')
            .expect(400,done);
    });


if ( typeof API_KEY !== 'undefined' ){

    it('should work for insee 94067 et section=0A', function(done){
        request(server)
            .get('/api/cadastre/parcelle?insee=94067&section=0A&apikey='+API_KEY)
            .expect(200,done);
    });

    it('should work for insee 33290 et section=0A et numero=0112 et com_abs=410', function(done){
        request(server)
            .get('/api/cadastre/parcelle?insee=94067&section=0A&numero=0112&com_abs=410&apikey='+API_KEY)
            .expect(200,done);
    });

} // API_KEY is defined

});



