/* eslint-env mocha */
const CadastreClient = require('../../lib/CadastreClient');
const expect = require('expect.js');
const nock = require('nock');

describe('CadastreClient', () => {
    describe('New client without apiKey', () => {
        it('should throw an exception', () => {
            expect(() => new CadastreClient()).to.throwException();
        });
    });
});

describe('getCapabilities()', () => {
    describe('Call with invalid or expired API key', () => {
        const client = new CadastreClient('bad_api_key', { serviceUrl: 'http://mock.wxs.ign.fr' });
        nock('http://mock.wxs.ign.fr/bad_api_key')
            .get('/geoportail/wfs')
            .query({ request: 'GetCapabilities' })
            .reply(400);
        it('should throw an exception', done => {
            client.getCapabilities(err => {
                expect(err).to.be.an(Error);
                done();
            });
        });
    });
    describe('Call with valid API key', () => {
        const client = new CadastreClient('valid_api_key', { serviceUrl: 'http://mock.wxs.ign.fr' });
        nock('http://mock.wxs.ign.fr/valid_api_key')
            .get('/geoportail/wfs')
            .query({ request: 'GetCapabilities' })
            .reply(200, 'capabilities');
        it('should return capabilities', done => {
            client.getCapabilities((err, capabilities) => {
                expect(err).to.be(null);
                expect(capabilities).to.be('capabilities');
                done();
            });
        });
    });
});
