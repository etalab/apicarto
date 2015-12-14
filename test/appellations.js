/* eslint-env node, mocha */
const bboxPolygon = require('turf').bboxPolygon;
const geojsonhint = require('geojsonhint').hint;
const request = require('supertest');
const server = require('../server');
const expect = require('expect.js');

function returnValidGeoJSON(res) {
    expect(geojsonhint(res.body)).to.eql([]);
}

describe('/aoc/api/beta/aoc', () => {
    describe('/in', () => {
        const bboxWithinAppellations = [-0.439, 44.694, -0.437, 44.696];
        const bboxOutsideFrance = [-6.086, 46.3, -5, 46.5];

        function makeRequest() {
            return request(server)
                .post('/aoc/api/beta/aoc/in');
        }
        function makeRequestWithBbox(bbox) {
            return makeRequest()
                .send({ geom: bboxPolygon(bbox) });
        }
        describe('not valid input type', () => {
            it('should reply with 400', done => {
                makeRequest()
                    .send('poiuh')
                    .expect(400, done);
            });
        });
        describe('request without geom', () => {
            it('should reply with 400', done => {
                makeRequest()
                    .send({ hello: 'coucou' })
                    .expect(400, done);
            });
        });
        describe('valid request outside France', () => {
            it('should reply with 400', done => {
                makeRequestWithBbox(bboxOutsideFrance)
                    .expect(400, done);
            });
        });
        describe('valid request inside France', () => {
            it('should reply with 200', done => {
                makeRequestWithBbox(bboxWithinAppellations)
                    .expect(200, done);
            });
            it('should reply with valid GeoJSON', done => {
                makeRequestWithBbox(bboxWithinAppellations)
                    .expect(returnValidGeoJSON)
                    .expect(200, done);
            });
        });
        describe('valid request inside an appellation zone', () => {
            it('should reply with a FeatureCollection containing at least one Feature', done => {
                makeRequestWithBbox(bboxWithinAppellations)
                    .expect(res => {
                        expect(res.body.type).to.eql('FeatureCollection');
                        expect(res.body.features).to.be.an('array');
                        expect(res.body.features.length).to.be.greaterThan(0);
                    })
                    .end(done);
            });
        });
    });
});
