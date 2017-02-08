/**
 * @module appMgr
 * @desc
 * @author Created by kimhou on 2016/12/6
 */
import path from 'path'
import ForkApp from './ForkApp'
import ClusterApp from './ClusterApp'
import * as gData from '../data'
import logger from '../../../util/logger'

export function createApp(config) {
	let app = config.execMod === 'fork' ? new ForkApp(config) : new ClusterApp(config);
	return app;
}

export function reloadAll() {
	logger.debug('[appMgr reloadAll] start', gData.appMap.size);
	return new Promise((resolve, reject)=> {
		let rst = [];
		for ([appId, app] of gData.appMap) {
			app.reload();
			rst.push({appName: app.appName, appId, pids: Array.from(app.childListMap.keys())});
		}
		resolve(rst);
	});
}

export function stopAll() {
	logger.debug('[appMgr stopAll] start', gData.appMap.size);
	return new Promise((resolve, reject)=> {
		let rst = [];
		for ([appId, app] of gData.appMap) {
			rst.push({appName: app.appName, appId, pids: Array.from(app.childListMap.keys())});
			app.stop();
		}
		resolve(rst);
	});
}
export async function deleteAll() {
	logger.debug('[appMgr killAll] start', gData.appMap.size);
	try {
		let rst = [];
		for ([appId, app] of gData.appMap) {
			app.stop();
			app.removeAllListeners && app.removeAllListeners();
			rst.push(`app <${app.appName}> deleted`);
			app = null;
			gData.appMap.delete(appId);
		}
		return Promise.resolve(rst.join('\n'));
	} catch (e) {
		return Promise.reject(e);
	}
}