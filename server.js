const debug = require('debug')('apicarto');
const app = require('./app');

var port = process.env.PORT || 8091;
app.listen(port, () => {
    debug(`apicarto is running on port ${port} (see http://localhost:${port}/api/doc/ )`);
});
