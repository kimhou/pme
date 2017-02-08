'use strict';

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logger2.default.debug('[processForkContainer start]', JSON.stringify(process.env)); /**
                                                                                      * @module ProcessForkContainer
                                                                                      * @desc
                                                                                      * @author Created by kimhou on 2016/12/8
                                                                                      */

process.title = 'pme:fork ->' + process.env.pme_env_script;

// Require the real application
if (process.env.pme_env_script) {
  require('module')._load(process.env.pme_env_script, null, true);
} else {
  throw new Error('fork process load script failed, script not found!');
}

// Change some values to make node think that the user's application
// was started directly such as `node app.js`
process.mainModule.loaded = false;
require.main = process.mainModule;