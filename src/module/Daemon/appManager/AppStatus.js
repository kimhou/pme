/**
 * @module AppStatus
 * @desc
 * @author Created by kimhou on 2016/12/9
 */
export const STATUS_DEFAULT = 0;
export const STATUS_CREATED = 1;
export const STATUS_OFFLINE = 2;
export const STATUS_ONLINE = 3;
export const STATUS_ERROR = 4;
export const STATUS_STARTING = 5;
export const STATUS_STOPPING = 6;
export const STATUS_RESTARTING = 7;
export const STATUS_RELOADING = 8;
export const STATUS_DISCONNECTED = 9;
export const STATUS_EXIT = 10;

export const STATUS_DESC = {
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
}

export function isCanStart(app) {
	return app && app.appConfig
		&& app.appConfig.script
		&& [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}

export function isCanStop(app) {
	return app && app.appConfig
		&& app.appConfig.script
		&& [STATUS_ONLINE, STATUS_ERROR, STATUS_RESTARTING].indexOf(app.status) !== -1;
}

export function isCanRestart(app) {
	return app && app.appConfig
		&& app.appConfig.script
		&& [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ONLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}

export function isCanReload(app) {
	return app && app.appConfig
		&& app.appConfig.script
		&& [STATUS_DEFAULT, STATUS_CREATED, STATUS_OFFLINE, STATUS_ONLINE, STATUS_ERROR].indexOf(app.status) !== -1;
}