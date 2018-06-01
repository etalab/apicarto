/* eslint-env node, mocha */
const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

describe('/api/gpu/document', function() {
    describe('without filtering parameter', function() {
        it('should reply with 400', function(done) {
            request(server)
                .get('/api/gpu/document')
                .expect(400, done);
        });
    });

    describe('with point at [1.654399,48.112235] (Rennes)', function() {
        it('should reply a FeatureCollection containing a valid Feature', function(done) {
            request(server)
                .get('/api/gpu/document?geom={"type":"Point","coordinates":[1.654399,48.112235]}')
                .expect(200)
                .expect(res => {
                    expect(res.body.features.length).to.eql(1);
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties.du_type).to.eql('PLU');
                    expect(feature.properties.partition).to.eql('DU_28190');
                })
                .end(done);
            ;
        });
    });
});
