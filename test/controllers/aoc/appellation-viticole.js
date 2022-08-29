/* eslint-env node, mocha */
const bboxPolygon = require('@turf/turf').bboxPolygon;
const geojsonhint = require('@mapbox/geojsonhint').hint;
const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');

function returnValidGeoJSON(res) {
    expect(geojsonhint(res.body).filter(function (hint) {
        return hint.level === 'error';
    })).to.eql([]);
}


const bboxWithinAppellations = [-0.439, 44.694, -0.437, 44.696];
const bboxOutsideFrance = [-6.086, 46.3, -5, 46.5];

function makeRequest(geom) {
    return request(app)
        .get('/api/aoc/appellation-viticole')
        .send({geom: geom});
}

function makeRequestWithBbox(bbox) {
    var geom = bboxPolygon(bbox).geometry;
    return makeRequest(geom);
}

describe('/api/aoc/appellation-viticole', () => {

    describe('not valid input type', () => {
        it('should reply with 400', done => {
            makeRequest()
                .send('poiuh')
                .expect(400, done);
        });
    });

    describe('request without geom', () => {
        it('should reply with 404', done => {
            makeRequest()
                .send({ hello: 'coucou' })
                .expect(404, done);
        });
    });

});
