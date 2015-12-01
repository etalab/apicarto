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



/**
 * URL vers le service WFS
 */
CadastreClient.prototype.getBaseUrl = function () {
    return 'http://wxs.ign.fr/'+this.apiKey+'/geoportail/wfs';
};

CadastreClient.prototype.getDefaultOptions = function(){
    return {
        uri: this.getBaseUrl(),
        headers: {
            'Referer': this.referer
        }
    };
};


CadastreClient.prototype.getCapabilities = function(callback){
    var options = this.getDefaultOptions();
    options.uri += '?request=GetCapabilities';
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback(null);
        }
    });
};

/**
 * Récupération des communes pour un code département et un code commune
 */
CadastreClient.prototype.getDivisions = function(params, callback){
    var options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var geojson = turf.flip(JSON.parse(body));
                callback(geojson);
            } catch(err){
                callback(null);
            }
        }else{
            callback(null);
        }
    });
};


/**
 * Récupération des parcelles
 */
CadastreClient.prototype.getParcelles = function(params, callback){
    var options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var geojson = turf.flip(JSON.parse(body));
                callback(geojson);
            } catch(err) {
                callback(null);
            }
        }else{
            callback(null);
        }
    });
};


/* Recuperer les informations du cadastre à partir d'une geometrie
 * le résultat retourne :
 * Informations sur la parcelle
 * Calcul des surfaces et des intersections
 */

CadastreClient.prototype.getCadastreFromGeom = function (feature, callback) {
    var geomInitialParams = feature;
    var paramsGeom = {
        geom: feature.geometry
    };
    var options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(paramsGeom));

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var geojson = turf.flip(JSON.parse(body));
                var resultatGeom = geom_featureCollection(geojson, geomInitialParams);
                callback(resultatGeom);
            } catch(err) {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};

/**
 * Récupération des geometries d'une commune
 * Passage en parametre code_insee de la commune
 */
CadastreClient.prototype.getCommune = function(params, callback){
    var options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var geojson = turf.flip(JSON.parse(body));
                callback(geojson);
            } catch(err){
                callback(null);
            }
        }else{
            callback(null);
        }
    });
};

/**
 * Récupération des localisant
 * Passage en parametre code_insee de la commune et/ou section et/ou numero
 */
CadastreClient.prototype.getLocalisant = function(params, callback){
    var options = this.getDefaultOptions();
    options.uri += '?request=GetFeature&version=2.0.0' ;
    options.uri += '&typename=BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:localisant' ;
    options.uri += '&outputFormat='+encodeURIComponent('application/json') ;
    options.uri += '&cql_filter='+encodeURIComponent(cql_filter(params));

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var geojson = turf.flip(JSON.parse(body));
                callback(geojson);
            } catch(err){
                callback(null);
            }
        }else{
            callback(null);
        }
    });
};

module.exports = CadastreClient ;
