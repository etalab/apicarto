
var rp = require('request-promise');
var clq_filter = require('../lib/cql_filter');

/**
 * @classdesc
 * WFS access client for the geoportal
 * @constructor
 */
var ClientDreal = function (options) {
    // should be removed to allow user/password?
    this.url = options.url || 'https://georchestra.ac-corse.fr/geoserver/wfss';
    this.headers = options.headers || {};
};

/**
 * Get WFS URL
 */
ClientDreal.prototype.getUrl = function () {
    return this.url.replace('{apiKey}', this.apiKey);
};


/**
 * @private
 * @returns {Object}
 */
ClientDreal.prototype.getDefaultParams = function () {
    return {
        service: 'WFS',
        version: '2.0.0'
    };
}

/**
 * @private
 * @returns {Object}
 */
ClientDreal.prototype.getDefaultHeaders = function(){
    return this.headers;
}


/**
 * Get features for a given type
 * @param {string} typeName - name of type
 * @param {Object} params - define cumulative filters (bbox, geom) and to manage the pagination
 * @return {Promise}
 */
ClientDreal.prototype.getFeatures = function (typeName, params) {
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

module.exports = ClientDreal;
