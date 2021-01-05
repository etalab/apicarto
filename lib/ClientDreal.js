
var rp = require('request-promise');
var clq_filter = require('../lib/cql_filter');


class ClientDreal {

    /**
     * Constructeur avec :
     * apiKey : une clé IGN avec les droits sur BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad et BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle
     * options :
     * - referer: le referer correspondant à la clée
     * - serviceUrl: url racine du service geoportail
     */
    constructor( options) {
        this.referer = 'http://localhost';
        this.serviceUrl = 'https://georchestra.ac-corse.fr/geoserver/wfs';
    }

    getDefaultOptions() {
        return {
            uri: `${this.serviceUrl}`,
            service: 'WFS',
            version: '2.0.0',
            headers: {
                Referer: this.referer
            }
        };
    }

   
    /**
     * Récupération des parcelles
     */
    getFeatures(typeName, params) {
        var params = params || {};
    
        var headers = this.getDefaultHeaders();
        headers['Accept'] = 'application/json';
    
        /*
         * GetFeature params 
         */
        var queryParams = this.getDefaultParams();
        queryParams['request']  = 'GetFeature';
        queryParams['typename'] = typeName;
        queryParams['outputFormat'] = 'application/json';
        queryParams['srsName'] = 'CRS:84';
        if (typeof params._limit !== 'undefined') {
            queryParams['count'] = params._limit;
        }
        if (typeof params._start !== 'undefined') {
            queryParams['startIndex'] = params._start;
        }
        
        /*
         * bbox and attribute filter as POST parameter
         */
        var cql_filter = clq_filter(params);
        var body = (cql_filter !== null) ? 'cql_filter=' + encodeURI(cql_filter) : '';
        queryParams['cql_filter'] = cql_filter;
    
        console.log('BODY : '+body);
        console.log('CQL FILTER : ' +queryParams['cql_filter']);
        var options= {
            uri:this.getUrl(),
            method:'POST',
            qs: queryParams,
            headers: headers
        };
        return rp(options)
            .then(function(result) {
                return JSON.parse(result);
            }).catch(function(err) {
                console.log("err_backend" + err);
            })
        
    };

}

    module.exports = ClientDreal;

