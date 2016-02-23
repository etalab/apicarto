'use strict';
var request = require('request');
var turf = require('turf');

var geom_featureCollection = require('./geom_featurecollection.js') ;
var cql_filter = require('./cql_filter');

/**
 * Constructeur avec :
 * apiKey : une clé IGN avec les droits sur BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad et BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle
 * referer : le referer correspondant à la clée
 */
var CadastreClient = function (apiKey,referer) {
    this.apiKey = apiKey;
    this.referer = referer || 'http://localhost';
};


function geoportailRequest(options, done) {
    request(options, function(err, response, body) {
        if (err) return done(err);
        if (response.statusCode !== 200) {
            const error = new Error('Géoportail returned an error: ' + response.statusCode);
            error.responseBody = body;
            error.statusCode = response.statusCode;
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

/**
 * URL vers le service WFS
 */
CadastreClient.prototype.getBaseUrl = function () {
    return 'http://wxs.ign.fr/'+this.apiKey+'/geoportail/wfs';
};

CadastreClient.prototype.getDefaultOptions = function () {
    return {
        uri: this.getBaseUrl(),
        headers: {
            'Referer': this.referer
        }
    };
};


CadastreClient.prototype.getCapabilities = function (done) {
    const options = this.getDefaultOptions();
    options.uri += '?request=GetCapabilities';
    geoportailRequest(options, done);
};

/**
 * Récupération des communes pour un code département et un code commune
 */
CadastreClient.prototype.getDivisions = function (params, done) {
    const options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    geoportailRequest(options, function (err, body) {
        if (err) return done(err);
        parseGeoJSONAndFlip(body, done);
    });
};


/**
 * Récupération des parcelles
 */
CadastreClient.prototype.getParcelles = function (params, done) {
    const options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    geoportailRequest(options, function(err, body) {
        if (err) return done(err);
        parseGeoJSONAndFlip(body, done);
    });
};


/* Recuperer les informations du cadastre à partir d'une geometrie
 * le résultat retourne :
 * Informations sur la parcelle
 * Calcul des surfaces et des intersections
 */

CadastreClient.prototype.getCadastreFromGeom = function (feature, done) {
    const geomInitialParams = feature;
    const paramsGeom = {
        geom: feature.geometry
    };
    const options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(paramsGeom));

    geoportailRequest(options, function(err, body) {
        if (err) return done(err);
        parseGeoJSONAndFlip(body, function (err, geojson) {
            if (err) return done(err);
            done(null, geom_featureCollection(geojson, geomInitialParams));
        });
    });
};

/**
 * Récupération des geometries d'une commune
 * Passage en parametre code_insee de la commune
 */
CadastreClient.prototype.getCommune = function (params, done) {
    const options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    geoportailRequest(options, function(err, body) {
        if (err) return done(err);
        parseGeoJSONAndFlip(body, done);
    });
};

/**
 * Récupération des localisant
 * Passage en parametre code_insee de la commune et/ou section et/ou numero
 */
CadastreClient.prototype.getLocalisant = function (params, done) {
    const options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    geoportailRequest(options, function(err, body) {
        if (err) return done(err);
        parseGeoJSONAndFlip(body, done);
    });
};

module.exports = CadastreClient ;
