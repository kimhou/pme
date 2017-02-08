'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module ForkApp
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/12/9
                                                                                                                                                                                                                                                                   */


var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

var _AppStatus = require('./AppStatus');

var APP_STATUS = _interopRequireWildcard(_AppStatus);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ForkApp extends _App2.default {
	constructor(appConfig) {
		super(appConfig);

		_initialiseProps.call(this);
	}

	createChild() {
		return new Promise((resolve, reject) => {
			if (this.childListMap.size > this.instances) {
				_logger2.default.debug(`[create child passed] childSize:${ this.childListMap.size }, instances: ${ this.instances }`);
				return;
			}

			const config = this.appConfig,
			      pme_env = process.pme_env;
			let env = _extends({}, pme_env, {
				pme_env_script: config.script,
				pme_env_cwd: pme_env.pme_env_cwd || process.cwd()
			});

			_logger2.default.debug('[cluster fork start]', JSON.stringify({ env }));
			const child = _cluster2.default.fork({ pme_env: JSON.stringify(env) });
			this.initChildListener(child);
			let timeout = setTimeout(() => {
				reject('start time out');
			}, 3000);
			child.once('online', () => {
				_logger2.default.debug(`App child online, ${ JSON.stringify({
					appName: this.appName,
					pid: child.process && child.process.pid
				}) }`);
				child.status = APP_STATUS.STATUS_ONLINE;
				resolve(child);
			});
		});
	}
}
exports.default = ForkApp;

var _initialiseProps = function _initialiseProps() {
	this.start = appConfig => {
		this.updateAppConfig(appConfig);
		if ((0, _AppStatus.isCanStart)(this)) {
			const config = this.appConfig;
			_logger2.default.debug('[startClusterApp start]', JSON.stringify(config));
			this.status = APP_STATUS.STATUS_STARTING;
			return new Promise((resolve, reject) => {
				let count = this.appConfig.instances || 1;
				_async2.default.series(new Array(count).fill(cb => {
					this.createChild().then(child => {
						if (child && child.pid) {
							this.childListMap.set(child.pid, child);
							_logger2.default.debug('new child created', child.pid);
							cb();
						} else {
							cb(new Error('create child is not alive'));
						}
					}).catch(e => {
						cb(new Error(e.message || e.msg || e || 'create child error'));
					});
				}), (e, rst) => {
					if (e) {
						_logger2.default.error('[fork child error]', e.message || e);
						this.status = APP_STATUS.STATUS_ERROR;
						reject(e);
					} else {
						_logger2.default.debug('[app fork child finished]');
						this.status = APP_STATUS.STATUS_ONLINE;
						resolve(`done, pids:${ this.getPids() }`);
					}
				});
			});
		} else {
			return Promise.reject({ msg: `app status <${ APP_STATUS.STATUS_DESC[this.status] }> can not start` });
		}
	};
};

module.exports = exports['default'];