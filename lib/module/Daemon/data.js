'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.DefaultAppParam = exports.appMap = exports.pmeAppId = exports.pmePid = exports.cpuCount = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module data
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/12/1
                                                                                                                                                                                                                                                                   */


exports.getNewPMEPid = getNewPMEPid;
exports.getApp = getApp;
exports.createAppConfigFromClient = createAppConfigFromClient;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('../../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cpuCount = exports.cpuCount = _os2.default.cpus().length;

let pmePid = exports.pmePid = 0;
let pmeAppId = exports.pmeAppId = 0;

let appMap = exports.appMap = new Map();

const DefaultAppParam = exports.DefaultAppParam = {
	appName: '',
	appId: 0,
	script: '',
	execMod: 'fork', //fork|cluster
	instances: cpuCount
};

function getNewPMEPid() {
	return exports.pmePid = pmePid += 1;
}

function getApp({ appId, appName, script } = {}) {
	let app = Array.from(appMap.values()).filter(x => x.appId === Number(appId) || x.appName === appName || x.script === script);
	return app && app.length && app[0];
}

function createAppConfigFromClient(param) {
	if (!param.script || !_fs2.default.existsSync(param.script)) return;

	let instances;
	if (param.instances) {
		instances = (0, _util.isNumber)(param.instances) ? Number(param.instances) : cpuCount;
		instances = instances < 0 ? cpuCount - instances : instances;
		instances = instances > 0 && instances <= cpuCount ? instances : cpuCount;
	}
	let config = _extends({}, DefaultAppParam, param, {
		appId: exports.pmeAppId = pmeAppId += 1,
		execMod: instances ? 'cluster' : 'fork',
		instances
	});

	if (!config.appName) {
		let name = config.script.match(/\/([^/]+)\.js/);
		name = name && name.length && name[1] || `app-${ config.appId }`;
		config.appName = name;
	}

	return config;
}