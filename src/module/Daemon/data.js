/**
 * @module data
 * @desc
 * @author Created by kimhou on 2016/12/1
 */
import os from 'os'
import fs from 'fs'
import {isNumber} from '../../util'

export const cpuCount = os.cpus().length;

export let pmePid = 0;
export let pmeAppId = 0;

export let appMap = new Map();


export const DefaultAppParam = {
	appName: '',
	appId: 0,
	script: '',
	execMod: 'fork',//fork|cluster
	instances: cpuCount
};

export function getNewPMEPid() {
	return ++pmePid;
}

export function getApp({appId, appName, script} = {}) {
	let app = Array.from(appMap.values()).filter(x=>x.appId === Number(appId) || x.appName === appName || x.script === script);
	return app && app.length && app[0];
}

export function createAppConfigFromClient(param) {
	if (!param.script || !fs.existsSync(param.script))return;

	let instances;
	if (param.instances) {
		instances = isNumber(param.instances) ? Number(param.instances) : cpuCount;
		instances = instances < 0 ? cpuCount - instances : instances;
		instances = instances > 0 && instances <= cpuCount ? instances : cpuCount;
	}
	let config = {
		...DefaultAppParam,
		...param,
		appId: ++pmeAppId,
		execMod: instances ? 'cluster' : 'fork',
		instances
	};

	if (!config.appName) {
		let name = config.script.match(/\/([^/]+)\.js/);
		name = name && name.length && name[1] || `app-${config.appId}`;
		config.appName = name;
	}

	return config;
}