'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module App
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/12/9
                                                                                                                                                                                                                                                                   */


var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _data = require('../data');

var gData = _interopRequireWildcard(_data);

var _AppStatus = require('./AppStatus');

var APP_STATUS = _interopRequireWildcard(_AppStatus);

var _process = require('../../../util/process');

var proUtil = _interopRequireWildcard(_process);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _dateFormat = require('date-format');

var _dateFormat2 = _interopRequireDefault(_dateFormat);

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class App extends _events2.default {
	constructor(appConfig = {}) {
		super();

		_initialiseProps.call(this);

		this.appConfig = appConfig;

		this.appId = appConfig.appId;
		this.appName = appConfig.appName;
		this.script = appConfig.script;
		this.execMod = appConfig.execMod;
		this.status = APP_STATUS.STATUS_CREATED;
		this.createTime = Date.now();
		this.restarts = 0;
		this.minReloadDuration = 3000;
		this.errRestarts = 0;
		this.childListMap = new Map();
		this.maxRestarts = 3;
		this.stopChildTimeout = 1000;

		gData.appMap.set(this.appId, this);
	}

	updateAppConfig(appConfig = {}) {
		this.appConfig = _extends({}, this.appConfig, {
			appConfig
		});
		this.appName = this.appConfig.appName;
		this.execMod = this.appConfig.execMod;
	}

	stop() {
		if (!(0, _AppStatus.isCanStop)(this)) {
			return Promise.reject(`app status ${ APP_STATUS.STATUS_DESC[this.status] } is not allow stop`);
		}
		return this.stopAllChild();
	}

	stopAllChild() {
		var _this = this;

		_logger2.default.debug(`[${ this.appName } stopAllChild] start`, this.childListMap.keys());
		this.status = APP_STATUS.STATUS_STOPPING;

		return new Promise((resolve, reject) => {
			let pids = Array.from(this.childListMap.keys());
			_async2.default.series(pids.map(pid => {
				return (() => {
					var _ref = _asyncToGenerator(function* (cb) {
						try {
							const child = _this.childListMap.get(pid);
							_logger2.default.debug(`[${ _this.appName } kill pid]`, pid);
							yield _this.stopChild(child);
							cb();
						} catch (e) {
							_logger2.default.error(`[${ _this.appName } kill pid error]`, JSON.stringify({
								pid,
								msg: e.message || e
							}));
							cb(e);
						}
					});

					return function (_x) {
						return _ref.apply(this, arguments);
					};
				})();
			}), err => {
				if (err) {
					let msg = err.stack || err.message || err;
					_logger2.default.error(`[${ this.appName } kill all child error]`, msg);
					this.status = APP_STATUS.STATUS_ERROR;
					reject(`${ this.appName } stoped error, ${ msg }`);
				} else {
					_logger2.default.debug(`[${ this.appName } kill all child success]`);
					this.status = APP_STATUS.STATUS_OFFLINE;
					this.childListMap.clear();
					resolve(`${ this.appName } stoped, pids: ${ pids }`);
				}
			});
		});
	}

	info() {
		return Promise.resolve({
			appId: this.appId,
			appName: this.appName,
			status: APP_STATUS.STATUS_DESC[this.status] || 'NONE',
			script: this.script,
			execMod: this.execMod,
			createTime: (0, _dateFormat2.default)('yyyy-MM-dd hh:mm:ss', new Date(this.createTime)),
			upTime: this.upTime ? (0, _dateFormat2.default)('yyyy-MM-dd hh:mm:ss', new Date(this.upTime)) : '--',
			restarts: this.restarts,
			childPids: this.getPids()
		});
	}

	initChildListener(child) {
		this.upTime = Date.now();
		child.pid = child.process && child.process.pid;

		if (!(child && child.process && child.process.pid)) {
			_logger2.default.debug(`[${ this.appName } init child listener passed] error child`);
			return;
		}
		_logger2.default.debug(`[${ this.appName } init child listener]`, child.process && child.process.pid, child.pid);
		child.on('message', msg => {
			_logger2.default.debug(`${ this.appName } child on message:`, msg);
		});
		child.once('error', e => {
			child.status = APP_STATUS.STATUS_ERROR;
			this.onChildError(child, e);
		});

		child.once('disconnect', () => {
			_logger2.default.info(`${ this.appName } child disconnect, ${ JSON.stringify({ appName: this.appName, pid: child.pid }) }`);
			child.status = APP_STATUS.STATUS_DISCONNECTED;
		});

		child.once('exit', (code, signal) => {
			child.status = APP_STATUS.STATUS_EXIT;
			this.onChildExit(child, code || 0, signal || 'SIGINT');
		});
	}

	stopChild(child, isForce) {
		return new Promise((resolve, reject) => {
			const pid = child && child.process && child.process.pid;
			const killProcess = () => {
				_logger2.default.debug(`[${ this.appName } stopChild] forece kill child`, pid);
				proUtil.killChild(child).then(() => resolve('child stop done:', pid)).catch(e => reject(e));
			};
			if (pid) {
				_logger2.default.debug(`[${ this.appName } stop child] start:`, pid);
				try {
					child.removeAllListeners && child.removeAllListeners();
					child.process && child.process.connected && child.send && child.send('shutdown');
				} catch (e) {
					_logger2.default.error(`[${ this.appName } stop child prepare error]`, e.stack || e.message);
				}
				if (this.execMod === 'cluster') {
					_logger2.default.debug(`[${ this.appName } stop cluster child], ${ JSON.stringify({
						pid: child.pid,
						state: child.state
					}) }`);
					if (child.suicide != true && ['dead', 'disconnected'].indexOf(child.state) == -1) {
						_logger2.default.debug(`[${ this.appName } child(${ child.pid }) is alive, disconnect first`);
						const timeout = setTimeout(() => {
							_logger2.default.debug(`[${ this.appName } child(${ child.pid }) disconnected timeout`);
							killProcess();
						}, this.stopChildTimeout);
						child.once('disconnected', () => {
							_logger2.default.debug(`[${ this.appName } child(${ child.pid }) on disconnected`);
							killProcess();
						});
					} else {
						killProcess();
					}
				} else {
					killProcess();
				}
			} else {
				_logger2.default.debug('process is dead, stop child passed!');
				resolve('process is dead');
			}
		});
	}

	onChildError(child, e) {
		_logger2.default.error('[App child on error]', e.stack || e.message || e);
		child.status = APP_STATUS.STATUS_ERROR;
		let pid = child.pid;
		proUtil.killChild(child).then(() => _logger2.default.info('error child killed:', pid)).catch(e => _logger2.default.error('error child kill failed:', pid));
		this.autoReload();
	}

	onChildExit(child, code, signal) {
		_logger2.default.warn('[App child on exit]', JSON.stringify({
			pid: child && child.process && child.process.pid,
			code,
			signal,
			status: APP_STATUS.STATUS_DESC[child.status]
		}));
		if ([APP_STATUS.STATUS_STOPPING, APP_STATUS.STATUS_RELOADING, APP_STATUS.STATUS_RESTARTING, APP_STATUS.STATUS_STARTING].indexOf(this.status) === -1) {
			this.autoReload();
		}
	}

	getPids() {
		return this.childListMap && Array.from(this.childListMap.keys());
	}

}
exports.default = App;

var _initialiseProps = function _initialiseProps() {
	var _this2 = this;

	this.restart = (() => {
		var _ref2 = _asyncToGenerator(function* (appConfig) {
			if (!APP_STATUS.isCanRestart(_this2)) {
				return Promise.reject({ msg: `app status <${ APP_STATUS.STATUS_DESC[_this2.status] }> can not restart` });
			}
			let oldPids = _this2.getPids();
			_logger2.default.debug(`[${ _this2.appName } restart] start, pids:${ oldPids }`);
			_this2.updateAppConfig(appConfig);
			_this2.status = APP_STATUS.STATUS_RESTARTING;
			_this2.errRestarts = 0;
			_this2.restarts++;
			try {
				yield _this2.stopAllChild();
				yield _this2.start();
				return Promise.resolve(`${ _this2.appName } restart done: ${ oldPids } => ${ _this2.getPids() }`);
			} catch (e) {
				_this2.status = APP_STATUS.STATUS_ERROR;
				return Promise.reject(e);
			}
		});

		return function (_x2) {
			return _ref2.apply(this, arguments);
		};
	})();

	this.reload = appConfig => {
		if (!APP_STATUS.isCanReload(this)) {
			return Promise.reject({ msg: `app status <${ APP_STATUS.STATUS_DESC[this.status] }> can not reload` });
		}

		_logger2.default.debug(`[${ this.appName } reload start] pids:`, this.childListMap.keys());

		this.updateAppConfig(appConfig);

		return new Promise((resolve, reject) => {
			if (this.childListMap.size === 0) {
				_logger2.default.debug(`[${ this.appName } reload] find child size = 0, use start`);
				this.start().then(rst => resolve(rst)).catch(e => reject(e));
				return;
			}
			this.restarts++;
			this.status = APP_STATUS.STATUS_RELOADING;

			const oldPids = this.getPids();

			if (this.execMod == 'cluster') {
				const seriesArr = Array.from(this.childListMap.values()).map(child => cb => {
					try {
						const oldPid = child && child.pid;
						this.childListMap.delete(oldPid);
						this.createChild().then(newChild => {
							const newPid = newChild && newChild.pid;
							if (!newPid) return cb(new Error('new pid error'));
							_logger2.default.debug(`[${ this.appName } reload] new child created`, newPid);
							this.childListMap.set(newPid, newChild);
							this.stopChild(child).then(() => {
								_logger2.default.debug(`[${ this.appName } reload] old child stoped`, oldPid);
								cb();
							}).catch(e => {
								_logger2.default.error(`[${ this.appName } reload] old child stop on error`, e);
								cb(e);
							});
						}).catch(e => {
							_logger2.default.error(`[${ this.appName } reload] create child on error`, e);
							cb(e);
						});
					} catch (e) {
						_logger2.default.error(`[${ this.appName } child reload on try catch error]`, e);
						cb(e);
					}
				});
				_async2.default.series(seriesArr, e => {
					_logger2.default.debug(`[${ this.appName } reload] series done, `, e && (e.stack || e.message || e));
					if (e) {
						this.status = APP_STATUS.STATUS_ERROR;
						reject(e);
					} else {
						this.status = APP_STATUS.STATUS_ONLINE;
						resolve(`${ this.appName } reload done: ${ oldPids.join(',') } => ${ this.getPids().join(',') }`);
					}
				});
			} else {
				try {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = this.childListMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var _ref3 = _step.value;

							var _ref4 = _slicedToArray(_ref3, 2),
							    pid = _ref4[0],
							    child = _ref4[1];

							_logger2.default.debug(`[${ this.appName } reload] kill old child start:`, pid);
							proUtil.killChild(child).then(() => {
								_logger2.default.debug(`[${ this.appName } reload] kill old child done:`, pid);
								this.childListMap.clear();
								this.createChild().then(newChild => {
									const newPid = newChild && newChild.pid;
									if (!newPid) return reject(new Error('new pid error'));
									_logger2.default.debug(`[${ this.appName } reload] new child create:`, newPid);
									this.childListMap.set(newChild.pid, newChild);
									this.status = APP_STATUS.STATUS_ONLINE;
									resolve(`${ this.appName } reload done: ${ oldPids.join(',') } => ${ this.getPids().join(',') }`);
								}).catch(e => {
									_logger2.default.debug(`[${ this.appName } reload] kill old child error:`, pid, e.stack || e.message || e);
									this.status = APP_STATUS.STATUS_ERROR;
									reject(e);
								});
							}).catch(e => {
								this.status = APP_STATUS.STATUS_ERROR;
								reject(e);
							});
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				} catch (e) {
					this.status = APP_STATUS.STATUS_ERROR;
					reject(e);
				}
			}
		});
	};

	this.autoReload = () => {
		_logger2.default.debug(`[auto reload start] errRestarts: ${ this.errRestarts }, maxRestarts: ${ this.maxRestarts }`);
		this.reloadTimeout && clearTimeout(this.reloadTimeout);
		let isError;
		if (Date.now() - this.upTime < this.minReloadDuration) {
			isError = true;
		}
		if (this.errRestarts >= this.maxRestarts) {
			this.status = APP_STATUS.STATUS_ERROR;
			_logger2.default.error(`app <${ this.appName }> on error to retry time maxed`);
			return;
		}
		this.reloadTimeout = setTimeout(() => {
			_logger2.default.debug('reloadTimeout');
			isError && this.errRestarts++;
			this.reload().then(rst => {
				_logger2.default.info('auto reload done:', rst);
			}).catch(e => {
				_logger2.default.error('auto reload error:', e.stack || e.message || e.msg || e);
			});
		}, this.minReloadDuration);
	};
};

module.exports = exports['default'];