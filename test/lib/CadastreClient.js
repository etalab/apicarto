/* eslint-env mocha */
const CadastreClient = require('../../lib/CadastreClient');
const expect = require('expect.js');
const nock = require('nock');

describe('CadastreClient', () => {
    describe('Constructor without apiKey', () => {
        it('should throw an exception', () => {
            expect(() => new CadastreClient()).to.throwException();
        });
    });

    describe('getCommune()', () => {
        describe('Invalid geoportail response format', () => {
            const client = new CadastreClient('api_key', { serviceUrl: 'http://mock.wxs.ign.fr' });
            nock('http://mock.wxs.ign.fr/api_key')
                .get('/geoportail/wfs')
                .query({
                    request: 'GetFeature',
                    typename: 'BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune',
                    version: '2.0.0',
                    outputFormat: 'application/json',
                    cql_filter: 'code_insee=12345'
                })
                .reply(200, 'Hello world!', { 'Content-Type': 'application/xml' });

            it('should throw an exception', done => {
                client.getCommune({ code_insee: 12345 }, err => {
                    expect(err).to.be.an(Error);
                    expect(err.message).to.contain('unexpected format');
                    done();
                });
            });
        });
    });

    describe('getCapabilities()', () => {
        describe('Call with invalid or expired API key', () => {
            const client = new CadastreClient('bad_api_key', { serviceUrl: 'http://mock.wxs.ign.fr' });
            nock('http://mock.wxs.ign.fr/bad_api_key')
                .get('/geoportail/wfs')
                .query({ request: 'GetCapabilities', version: '2.0.0' })
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
                .query({ request: 'GetCapabilities', version: '2.0.0' })
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
});
