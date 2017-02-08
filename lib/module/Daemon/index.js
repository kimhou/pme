'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module Daemon
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/11/28
                                                                                                                                                                                                                                                                   */


var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

try {
	process.pme_env = _extends({}, process.env, {
		customConfig: JSON.parse(process.env.customConfig)
	});
} catch (e) {
	console.log(e.stack);
}
const logger = require('../../util/logger');

logger.debug('[daemon index start] ', JSON.stringify(process.pme_env));

process.title = `pme:daemon(${ require('../../../package.json').version })`;

process.on('message', msg => {
	logger.debug('[Daemon on message]', msg);
});

process.on('uncaughtException', e => {
	logger.error('[daemon on uncaught exception error]', e.stack || e.message || e);
});

process.on('unhandledRejection', e => {
	logger.error('[daemon on uncaught unhandledRejection error]', e.stack || e.message || e);
});

//set master
const master = _path2.default.resolve(_path2.default.dirname(module.filename), 'appManager/ProcessClusterContainer.js');
_cluster2.default.setupMaster({
	exec: master
});

logger.debug('[daemon setup cluster master]', master);

require('./daemon').initDaemonRpcServer();