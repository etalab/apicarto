/* eslint-env node, mocha */
const request = require('supertest');
const expect = require('expect.js');

const app = require('../../../app');

describe('/api/rpg/v2', function() {
    describe('without filtering parameter', function() {
        it('should reply with 400', function(done) {
            request(app)
                .get('/api/rpg/v2')
                .expect(400, done);
        });
    });

    describe('with invalid geom', function() {
        it('should reply an error', function(done) {
            request(app)
                .get('/api/rpg/v2?annee=2018&geom={"type":"Point","coordinates":[1.654399]}')
                .expect(400)
                .end(done);
            ;
        });
    });


    /*describe('with point at [1.654399,48.112235] (Rennes)', function() {
        it('should reply a list of FeatureCollection', function(done) {
            request(app)
                .get('/api/rpg/v2?annee=2018&geom={"type":"Point","coordinates":[1.654399,48.112235]}')
                .expect(200)
                .expect(res => {
                    //TODO vérifier les specs
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.eql(1);
                    res.body.forEach(function(featureCollection){
                        expect(featureCollection.type).to.equal("FeatureCollection");
                    });
                })
                .end(done);
            ;
        });
    });*/
});