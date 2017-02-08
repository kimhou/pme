'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isCanStart = isCanStart;
exports.isCanStop = isCanStop;
exports.isCanRestart = isCanRestart;
exports.isCanReload = isCanReload;
/**
 * @module AppStatus
 * @desc
 * @author Created by kimhou on 2016/12/9
 */
const STATUS_DEFAULT = exports.STATUS_DEFAULT = 0;
const STATUS_CREATED = exports.STATUS_CREATED = 1;
const STATUS_OFFLINE = exports.STATUS_OFFLINE = 2;
const STATUS_ONLINE = exports.STATUS_ONLINE = 3;
const STATUS_ERROR = exports.STATUS_ERROR = 4;
const STATUS_STARTING = exports.STATUS_STARTING = 5;
const STATUS_STOPPING = exports.STATUS_STOPPING = 6;
const STATUS_RESTARTING = exports.STATUS_RESTARTING = 7;
const STATUS_RELOADING = exports.STATUS_RELOADING = 8;
const STATUS_DISCONNECTED = exports.STATUS_DISCONNECTED = 9;
const STATUS_EXIT = exports.STATUS_EXIT = 10;

const STATUS_DESC = exports.STATUS_DESC = {
	[STATUS_DEFAULT]: 'INIT',
	[STATUS_CREATED]: 'CREATED',
	[STATUS_OFFLINE]: 'OFFLINE',
	[STATUS_ONLINE]: 'ONLINE',
	[STATUS_ERROR]: 'ERROR',
	[STATUS_STARTING]: 'STARTING',
	[STATUS_STOPPING]: 'STOPPING',
	[STATUS_RESTARTING]: 'RESTARTING',
	[STATUS_RELOADING]: 'RELOADING',
	[STATUS_DISCONNECTED]: 'DISCONNECTED',
	[STATUS_EXIT]: 'EXIT'
};

function isCanStart(app) {
	return app && app.appConfig && app.appConfig.script && [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}

function isCanStop(app) {
	return app && app.appConfig && app.appConfig.script && [STATUS_ONLINE, STATUS_ERROR, STATUS_RESTARTING].indexOf(app.status) !== -1;
}

function isCanRestart(app) {
	return app && app.appConfig && app.appConfig.script && [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ONLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}

function isCanReload(app) {
	return app && app.appConfig && app.appConfig.script && [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ONLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}