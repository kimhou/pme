'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module api
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2017/1/19
                                                                                                                                                                                                                                                                   */


exports.start = start;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _Client = require('./module/Client');

var _Client2 = _interopRequireDefault(_Client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function start({ method, param, commander }) {
	_logger2.default.debug('[top api start]', { method, param });

	const params = getAppParam({ param, commander });
	if (params) {
		createClient().then(client => {
			client.execRemote('start', params).then(rst => {
				printResult(null, rst, { method, param, commander });
				this.list({ method: 'list', param, commander });
			}).catch(e => {
				printResult(e, null, { method, param, commander });
			});
		}).catch(e => {
			printResult(e, null, { method, param, commander });
		});
	} else {
		printResult(null, 'param error', { method, param, commander });
	}
}

function createClient() {
	const client = new _Client2.default();
	return new Promise((resolve, reject) => {
		client.connect().then(() => {
			resolve(client);
		}).catch(e => {
			reject(e);
		});
	});
}

function getAppParam({ param, commander }) {
	let params = {
		instances: commander.instances,
		env: commander.env
	};
	let app = Array.isArray(param) ? param && param.length && param.join(',') : param;
	if (!app) {
		_logger2.default.error('app param error, need target!');
		return;
	}
	try {
		if (app.indexOf('.json') !== -1 || app.indexOf('.js') !== -1) {
			app = _path2.default.resolve(process.cwd(), app);
			if (!_fs2.default.existsSync(app)) {
				_logger2.default.error(`file not found:<${ app }>`);
				return;
			}
			if (app.indexOf('.json') !== -1) {
				params = _extends({}, params, require(app));
				if (!params.script) {
					_logger2.default.error('json file need param: <script:"your app entry file">');
					return;
				}
			} else {
				params = _extends({}, params, {
					script: app
				});
			}
			params.appName = commander.appName || params.appName;
			if (!params.appName) {
				let name = params.script.match(/\/([^/]+)\.js/i);
				params.appName = name && name.length > 1 && name[1];
			}
		} else {
			if (isNumber(app)) {
				params.appId = app;
			} else {
				params.appName = app;
			}
		}
		return params;
	} catch (e) {
		_logger2.default.error(e.stack);
	}
}

function printResult(err, result = {}, { method, param = '', commander, isTable }) {
	if (err) {
		_logger2.default.error(`
pme ${ method } ${ param } | failed
=============================
${ err.stack || err.message || err.msg || JSON.stringify(err) }
`);
	} else if (result.code == 0) {
		_logger2.default.success(`
pme ${ method } ${ param } | success
=============================
${ result.data || '' }
`);
	} else {
		_logger2.default.error(`
pme ${ method } ${ param } | failed
=============================
${ JSON.stringify(result.msg || result.message) }
${ JSON.stringify({ param }) }
`);
	}
}