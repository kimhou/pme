'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module ForkApp
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/12/9
                                                                                                                                                                                                                                                                   */


var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

var _AppStatus = require('./AppStatus');

var APP_STATUS = _interopRequireWildcard(_AppStatus);

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spawn = require('child_process').spawn;

class ForkApp extends _App2.default {
	constructor(appConfig) {
		super(appConfig);

		_initialiseProps.call(this);
	}

	createChild() {
		const config = this.appConfig,
		      pme_env = process.pme_env;
		try {
			if (this.childListMap.size > 0) {
				_logger2.default.error('[create child error] fork mod need childList is empty!');
				return Promise.reject(`child is running: ${ Array.from(this.childListMap.keys()) }`);
			}
			let cmd = pme_env.pme_env_exec_path,
			    nodeArgs = [_path2.default.resolve(_path2.default.dirname(module.filename), 'ProcessForkContainer.js')],
			    params = {
				env: _extends({}, pme_env, {
					pme_env_script: config.script
				}),
				detached: true,
				cwd: pme_env.pme_env_cwd || process.cwd(),
				stdio: ['pipe', 'pipe', 'pipe', 'ipc']
			};
			_logger2.default.debug('[ForkApp create child]', JSON.stringify({ cmd, nodeArgs, params, pme_env }));

			const child = spawn(cmd, nodeArgs, params);
			child.process = { pid: child.pid };
			this.initChildListener(child);
			child.stderr.on('data', data => {
				_logger2.default.error('[fork child on stderr]');
				this.onChildError(child, data.toString('utf-8'));
			});
			child.unref();
			return Promise.resolve(child);
		} catch (e) {
			return Promise.reject(e);
		}
	}
}
exports.default = ForkApp;

var _initialiseProps = function _initialiseProps() {
	this.start = appConfig => {
		this.updateAppConfig(appConfig);
		return new Promise((resolve, reject) => {
			if ((0, _AppStatus.isCanStart)(this)) {
				_logger2.default.debug('[startForkApp start]');
				this.status = APP_STATUS.STATUS_STARTING;
				this.createChild().then(child => {
					if (child && child.pid) {
						this.childListMap.set(child.pid, child);
						this.status = APP_STATUS.STATUS_ONLINE;
						return resolve(`app <${ this.appName }> start done, pids:${ this.getPids() }`);
					} else {
						this.status = APP_STATUS.STATUS_ERROR;
						return reject(`app <${ this.appName }> start failed!`);
					}
				}).catch(e => {
					reject(e);
				});
			} else {
				return reject({
					msg: `app <${ this.appName }> status <${ APP_STATUS.STATUS_DESC[this.status] }> can not start`
				});
			}
		});
	};
};

module.exports = exports['default'];