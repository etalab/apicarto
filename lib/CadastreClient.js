'use strict';
const request = require('request');
const turf = require('@turf/turf');

const geojson_intersect = require('./geojson_intersection.js');
const cql_filter = require('./cql_filter');

function geoportailRequest(options, done) {
    request(options, function(err, response, body) {
        if (err) return done(err);
        if (response.statusCode !== 200) {
            const error = new Error('Géoportail returned an error: ' + response.statusCode);
            error.responseBody = body;
            error.statusCode = response.statusCode;
            return done(error);
        }
        if (options.expectedFormat &&
            response.headers['content-type'] &&
            !response.headers['content-type'].includes(options.expectedFormat)) {
            const error = new Error(`Géoportail returned an unexpected format: ${response.headers['content-type']}. Expected: ${options.expectedFormat}`);
            error.responseBody = body;
            return done(error);
        }
        done(null, body);
    });
}

function parseGeoJSONAndFlip(rawText, done) {
    let result, error;
    try {
        result = turf.flip(JSON.parse(rawText));
    } catch (err) {
        error = err;
    }
    done(error, result);
}


class CadastreClient {

    /**
     * Constructeur avec :
     * apiKey : une clé IGN avec les droits sur BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad et BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle
     * options :
     * - referer: le referer correspondant à la clée
     * - serviceUrl: url racine du service geoportail
     */
    constructor(apiKey, options) {
        if (!apiKey) throw new Error('Required param: apiKey');
        this.apiKey = apiKey;
        this.referer = options.referer || 'http://localhost';
        this.serviceUrl = options.serviceUrl || 'http://wxs.ign.fr';
    }

    getDefaultOptions() {
        return {
            uri: `${this.serviceUrl}/${this.apiKey}/geoportail/wfs`,
            qs: { version: '2.0.0' },
            headers: {
                Referer: this.referer
            }
        };
    }

    getCapabilities(done) {
        const options = this.getDefaultOptions();
        options.qs.request = 'GetCapabilities';
        geoportailRequest(options, done);
    }
    /* Recuperer les informations du cadastre à partir d'une geometrie
     * le résultat retourne :
     * Informations sur la parcelle
     * Calcul des surfaces et des intersections
     */
    getCadastreFromGeom(feature, done) {
        const geomInitialParams = feature;
        const paramsGeom = {
            geom: feature
        };
        const options = this.getDefaultOptions();
        options.qs.request = 'GetFeature';
        options.qs.typename = 'BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle';
        options.qs.outputFormat = 'application/json';
        options.qs.cql_filter = cql_filter(paramsGeom);
        options.expectedFormat = 'json';

        geoportailRequest(options, function(err, body) {
            if (err) return done(err);
            parseGeoJSONAndFlip(body, function (err, geojson) {
                if (err) return done(err);
                geojson.features.forEach(feature => {
                    feature.properties.surface_intersection = geojson_intersect(feature, geomInitialParams);
                    feature.properties.surface_parcelle = turf.area(feature);
                });
                done(null, geojson);
            });
        });
    }

   

}

module.exports = CadastreClient;
