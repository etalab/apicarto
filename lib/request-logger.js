const bunyan = require('bunyan');
const uuidV4 = require('uuid/v4');
const onFinished = require('on-finished');
const _ = require('lodash');


module.exports = function () {
    const logger = bunyan.createLogger({
        name: 'request'
    });

    return function (req, res, next) {
        // Start request duration counter
        const startTime = Date.now();

        // Define request id
        req.reqId = uuidV4();

        const payload = {
            reqId: req.reqId,
            method: req.method,
            path: req.path,
            agent: req.headers['user-agent'],
            remote: req.ip || (req.connection && req.connection.remoteAddress)
        };

        // Query string
        const query = _.omit(req.query, 'geom');
        if (req.query.geom) query.geom = 'provided';
        if (Object.keys(query).length > 0) payload.query = query;

        onFinished(res, function (err, res) {
            payload.code = res.statusCode;
            payload.duration = Date.now() - startTime;
            if (res.getHeader('content-length')) payload.size = res.getHeader('content-length');
            logger.info(payload);
        });

        next();
    };
};
