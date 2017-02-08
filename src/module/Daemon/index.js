/**
 * @module Daemon
 * @desc
 * @author Created by kimhou on 2016/11/28
 */
import path from 'path'
import cluster from 'cluster'

try {
	process.pme_env = {
		...process.env,
		customConfig: JSON.parse(process.env.customConfig)
	};
} catch (e) {
	console.log(e.stack);
}
const logger = require('../../util/logger');

logger.debug('[daemon index start] ', JSON.stringify(process.pme_env));

process.title = `pme:daemon(${require('../../../package.json').version})`;

process.on('message', (msg)=> {
	logger.debug('[Daemon on message]', msg);
});

process.on('uncaughtException', (e)=> {
	logger.error('[daemon on uncaught exception error]', e.stack || e.message || e);
});

process.on('unhandledRejection', (e)=> {
	logger.error('[daemon on uncaught unhandledRejection error]', e.stack || e.message || e);
});

//set master
const master = path.resolve(path.dirname(module.filename), 'appManager/ProcessClusterContainer.js');
cluster.setupMaster({
	exec: master
});

logger.debug('[daemon setup cluster master]', master);

require('./daemon').initDaemonRpcServer();

