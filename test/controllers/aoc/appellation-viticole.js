/* eslint-env node, mocha */
const bboxPolygon = require('@turf/turf').bboxPolygon;
const geojsonhint = require('@mapbox/geojsonhint').hint;
const request = require('supertest');
const expect = require('expect.js');

const server = require('../../../server');

function returnValidGeoJSON(res) {
    expect(geojsonhint(res.body).filter(function (hint) {
        return hint.level === 'error';
    })).to.eql([]);
}


const bboxWithinAppellations = [-0.439, 44.694, -0.437, 44.696];
const bboxOutsideFrance = [-6.086, 46.3, -5, 46.5];

function makeRequest() {
    return request(server)
        .post('/api/aoc/appellation-viticole');
}

function makeRequestWithBbox(bbox) {
    var geom = bboxPolygon(bbox).geometry;
    return makeRequest()
        .send({ geom: geom });
}

describe('/aoc/appellation-viticole', () => {

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
        it('should reply with 200', done => {
            makeRequestWithBbox(bboxOutsideFrance)
                .expect(200, done);
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
