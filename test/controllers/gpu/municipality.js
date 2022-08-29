/* eslint-env node, mocha */
const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');

describe('/api/gpu/municipality', function() {
    describe('without filtering parameter', function() {
        it('should reply with 400', function(done) {
            request(app)
                .get('/api/gpu/municipality')
                .expect(200)
                .expect(res => {
                    expect(res.body.features.length).to.be.greaterThan(10);
                })
                .end(done);
        });
    });

    describe('with insee=25349', function() {
        it('should reply with a valid feature', function(done) {
            request(app)
                .get('/api/gpu/municipality?insee=25349')
                .expect(200)
                .expect(res => {
                    expect(res.body.features.length).to.eql(1);
                    const feature = res.body.features[0];
                    expect(feature.properties.name).to.eql('LORAY');
                })
                .end(done);
            ;
        });
    });

    describe('with point at [1.654399,48.112235] (Rennes)', function() {
        it('should reply a FeatureCollection containing a valid Feature', function(done) {
            request(app)
                .get('/api/gpu/municipality?geom={"type":"Point","coordinates":[1.654399,48.112235]}')
                .expect(200)
                .expect(res => {
                    expect(res.body.features.length).to.eql(1);
                    const feature = res.body.features[0];
                    expect(feature.properties.is_rnu).to.eql(false);
                })
                .end(done);
            ;
        });
    });
});
