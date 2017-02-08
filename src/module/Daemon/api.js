/**
 * @module api
 * @desc
 * @author Created by kimhou on 2016/11/29
 */
import * as gData from './data'
import * as ERROR from '../Errors'
import * as appMgr from './appManager'
import logger from '../../util/logger'

const methodMapForClient = {start, restart, stop, reload, kill, info, list, deleteApp};

export function routeClientRequest(clientData) {
	if (clientData && clientData.method && methodMapForClient[clientData.method]) {
		try {
			let param = {appName: '', ...(clientData.params || {})};
			return methodMapForClient[clientData.method](param);
		} catch (e) {
			logger.debug('[daemon api] catched api method error:', e.stack || e.msg || e.message || e);
			return Promise.reject(e);
		}
	} else {
		return Promise.reject({
			...ERROR.APP_PARAM_ERROR,
			msg: `param [method] not found, ${clientData && clientData.method || 'lost'}`
		});
	}
}

function start(param) {
	logger.debug('[daemon start] start, param:', JSON.stringify(param));
	let app = gData.getApp(param);
	logger.debug('start get app:', app && app.appId);
	if (app) {
		return app.restart(param);
	} else {
		let appConfig = gData.createAppConfigFromClient(param);
		if (appConfig) {
			app = appMgr.createApp(appConfig);
			return app.start();
		} else {
			return Promise.reject(ERROR.APP_PARAM_ERROR);
		}
	}
}

function restart(param) {
	logger.debug('[daemon restart] start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map((app)=> {
			return app.restart();
		}));
	} else {
		let app = gData.getApp(param);
		logger.debug('restart get app:', app && app.appId);

		if (app) {
			return app.restart(param);
		} else {
			let appConfig = gData.createAppConfigFromClient(param);
			if (appConfig) {
				app = appMgr.createApp(appConfig);
				return app.start(param);
			} else {
				return Promise.reject(ERROR.APP_PARAM_ERROR);
			}
		}
	}
}
function stop(param) {
	logger.debug('stop app start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map((app)=> {
			return app.stop();
		}));
	} else {
		let app = gData.getApp(param);
		if (app) {
			return app.stop();
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}

function reload(param) {
	logger.debug('reload app start, param:', JSON.stringify(param));
	if (param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map((app)=> {
			return app.reload();
		}));
	} else {
		let app = gData.getApp(param);
		if (app) {
			app.errRestarts = 0;
			return app.reload(param);
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}

async function deleteApp(param) {
	logger.debug('delete app start, param:', JSON.stringify(param));
	if (param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map(({appId, appName})=> {
			return deleteApp({appId, appName});
		}));
	} else {
		let app = gData.getApp(param);
		if (app) {
			try {
				let rst = await app.stop();
				gData.appMap.delete(app.appId);
				return Promise.resolve(`app <${app.appName}> deleted`);
			} catch (e) {
				return Promise.reject(e);
			}
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}

async function kill() {
	logger.debug('[api kill] start');
	try {
		let rst = await Promise.all(Array.from(gData.appMap.values()).map(({appId, appName})=> {
			return deleteApp({appId, appName});
		}));
		exitProcess();
		return Promise.resolve(rst);
	} catch (e) {
		exitProcess();
		return Promise.reject('kill failed,', e.stack || e.message || e.msg || e);
	}
}

function exitProcess(cb) {
	try {
		gData.rpcServer.send({code: 0, msg: 'daemon kill complete'});
		gData.rpcServer.close();
		logger.info('kill daemon done');
		process.nextTick(()=>process.exit(0));
		cb && cb();
	} catch (e) {
		logger.error(e.stack || e.message);
	}
}

function info(param = {}) {
	logger.debug('app info start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		logger.debug('[info all app]');
		let rst = [];
		for ([appId, app] of gData.appMap) {
			rst.push(app.info());
		}
		return Promise.all(rst);
	} else {
		let app = gData.getApp(param);
		if (app && app.info) {
			logger.debug('[info get app]', app.appId, app.appName, app.status);
			return app.info();
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}

async function list(param = {}) {
	logger.debug('app list start, param:', JSON.stringify(param));
	try {
		let infoList = await info(param);
		if (!Array.isArray(infoList)) {
			infoList = [infoList];
		}
		return Promise.resolve(infoList.map(({appId, appName, status, execMod, createTime, upTime, restarts, childPids})=> ({
			id: appId, name: appName, status, mod: execMod,
			createTime, upTime,
			restarts, pids: childPids
		})));
	} catch (e) {
		return Promise.reject(e);
	}

	if (param.appName && param.appName.toLowerCase() === 'all') {
		logger.debug('[list all app]');
		let rst = [];
		for ([appId, app] of gData.appMap) {
			rst.push(app.info());
		}
		return Promise.all(rst);
	} else {
		let app = gData.getApp(param);
		if (app && app.info) {
			logger.debug('[info get app]', app.appId, app.appName, app.status);
			return app.info();
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}
////////////////////////

