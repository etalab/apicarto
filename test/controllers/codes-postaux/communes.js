/* eslint-env node, mocha */
const request = require('supertest');
const app = require('../../../app');

describe('/codes-postaux', function() {
    describe('/communes', function() {
        describe('too short postal code', function() {
            it('should reply with 400', function(done) {
                request(app)
                    .get('/api/codes-postaux/communes/7800')
                    .expect(400, done);
            });
        });

        describe('too long postal code', function() {
            it('should reply with 400', function(done) {
                request(app)
                    .get('/api/codes-postaux/communes/780000')
                    .expect(400, done);
            });
        });

        describe('alphabetic input', function() {
            it('should reply with 400', function(done) {
                request(app)
                    .get('/api/codes-postaux/communes/2A230')
                    .expect(400, done);
            });
        });

        describe('non-existent postal code', function() {
            it('should reply with 404', function(done) {
                request(app)
                    .get('/api/codes-postaux/communes/78123')
                    .expect(404, done);
            });
        });

        describe('legit postal code', function() {
            const POSTAL_CODE = '06650';
            const PAYLOAD = [ {
                codeCommune: '06089',
                nomCommune: 'Opio',
                codePostal: POSTAL_CODE,
                libelleAcheminement: 'OPIO'
            }, {
                codeCommune: '06112',
                nomCommune: 'Le Rouret',
                codePostal: POSTAL_CODE,
                libelleAcheminement: 'LE ROURET'
            } ];

            it('should reply with 200', function(done) {
                request(app)
                    .get(`/api/codes-postaux/communes/${POSTAL_CODE}`)
                    .expect(200, done);
            });

            it('should reply with a JSON payload', function(done) {
                request(app)
                    .get(`/api/codes-postaux/communes/${POSTAL_CODE}`)
                    .expect('Content-Type', /json/)
                    .end(done);
            });

            it('should reply with an array', function(done) {
                request(app)
                    .get(`/api/codes-postaux/communes/${POSTAL_CODE}`)
                    .expect(PAYLOAD, done);
            });
        });
    });
});
