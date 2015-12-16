/* eslint-env node, mocha */
const bboxPolygon = require('turf').bboxPolygon;
const geojsonhint = require('geojsonhint').hint;
const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');

function returnValidGeoJSON(res) {
    expect(geojsonhint(res.body)).to.eql([]);
}

describe('/quartiers-prioritaires', () => {
    describe('/layer', () => {
        describe('no bbox precised, return all qpv', () => {
            it('should reply with 200', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .expect(200, done);
            });
        });
        describe('valid request', () => {
            it('should reply with 200', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: [0, 0, 10, 10].toString()
          })
          .expect(200, done);
            });
            it('should reply with valid GeoJSON', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: [0, 0, 10, 10].toString()
          })
          .expect(returnValidGeoJSON)
          .expect(200, done);
            });
        });
        describe('request with an invalid bbox', () => {
            it('should reply with 400', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: '""'
          })
          .expect(400, done);
            });
        });
        describe('request with an array bbox', () => {
            it('should reply with 400', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: [0, 0, 10, 10]
          })
          .expect(400, done);
            });
        });
        describe('request with an invalid value bbox', () => {
            it('should reply with 400', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: ['l', 'e', 'l', 'o'].toString()
          })
          .expect(400, done);
            });
        });
        describe('with bbox', () => {
            it('should reply with 200', done => {
                request(server)
          .get('/quartiers-prioritaires/layer')
          .query({
              bbox: [
                  6.200065612792969,
                  49.09578937341408,
                  6.262550354003906,
                  49.12410690961101
              ].toString()
          })
          .expect(200)
          .expect(res => {
              const feature = res.body.features[0];
              expect(feature.geometry.type).to.eql('MultiPolygon');
              expect(feature.properties).to.eql({
                  code: 'QP057020',
                  nom: 'Borny',
                  commune: 'Metz'
              });
          })
          .end(done);
            });
        });
    });
    describe('/search', () => {
        function makeRequestWithBbox(bbox) {
            return request(server)
        .post('/quartiers-prioritaires/search')
        .send({
            geo: bboxPolygon(bbox).geometry
        });
        }
        describe('not valid input type', () => {
            it('should reply with 400', done => {
                request(server)
          .post('/quartiers-prioritaires/search')
          .send('poiuh')
          .expect(400, done);
            });
        });
        describe('request without geo', () => {
            it('should reply with 400', done => {
                request(server)
          .post('/quartiers-prioritaires/search')
          .send({
              hello: 'coucou'
          })
          .expect(400, done);
            });
        });
        describe('valid request', () => {
            it('should reply with 200', done => {
                request(server)
          .post('/quartiers-prioritaires/search')
          .send({
              geo: bboxPolygon([0, 0, 10, 10]).geometry
          })
          .expect(200, done);
            });
            it('should reply with valid GeoJSON', done => {
                request(server)
          .post('/quartiers-prioritaires/search')
          .send({
              geo: bboxPolygon([0, 0, 10, 10]).geometry
          })
          .expect(returnValidGeoJSON)
          .expect(200, done);
            });
        });
        describe('valid geo request which intersect one QP', () => {
            const makeRequest = () => {
                return makeRequestWithBbox([
                    6.200065612792969,
                    49.09578937341408,
                    6.262550354003906,
                    49.12410690961101
                ])
          .expect(200)
          .expect(returnValidGeoJSON);
            };
            it('should reply with a FeatureCollection containing one Feature', done => {
                makeRequest()
          .expect(res => {
              expect(res.body.type).to.eql('FeatureCollection');
              expect(res.body.features).to.be.an('array');
              expect(res.body.features.length).to.eql(1);
          })
          .end(done);
            });
            it('should reply a FeatureCollection containing a valid Feature', done => {
                makeRequest()
          .expect(res => {
              const feature = res.body.features[0];
              expect(feature.geometry.type).to.eql('MultiPolygon');
              expect(feature.properties).to.eql({
                  code: 'QP057020',
                  nom: 'Borny',
                  commune: 'Metz'
              });
          })
          .end(done);
            });
        });
        describe('valid geo request which does not intersect with any QP', () => {
            const makeRequest = () => {
                return makeRequestWithBbox([
                    6.395416259765625,
                    49.05744506755445,
                    6.425628662109375,
                    49.071391876307196
                ])
          .expect(200)
          .expect(returnValidGeoJSON);
            };
            it('should reply with an empty FeatureCollection', done => {
                makeRequest()
          .expect(res => {
              expect(res.body.type).to.eql('FeatureCollection');
              expect(res.body.features).to.be.an('array');
              expect(res.body.features.length).to.eql(0);
          })
          .end(done);
            });
        });
    });
});
