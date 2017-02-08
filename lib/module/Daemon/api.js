'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module api
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/11/29
                                                                                                                                                                                                                                                                   */


let deleteApp = (() => {
	var _ref = _asyncToGenerator(function* (param) {
		_logger2.default.debug('delete app start, param:', JSON.stringify(param));
		if (param.appName.toLowerCase() === 'all') {
			return Promise.all(Array.from(gData.appMap.values()).map(function ({ appId, appName }) {
				return deleteApp({ appId, appName });
			}));
		} else {
			let app = gData.getApp(param);
			if (app) {
				try {
					let rst = yield app.stop();
					gData.appMap.delete(app.appId);
					return Promise.resolve(`app <${ app.appName }> deleted`);
				} catch (e) {
					return Promise.reject(e);
				}
			} else {
				return Promise.reject(ERROR.APP_NOT_FOUND);
			}
		}
	});

	return function deleteApp(_x) {
		return _ref.apply(this, arguments);
	};
})();

let kill = (() => {
	var _ref2 = _asyncToGenerator(function* () {
		_logger2.default.debug('[api kill] start');
		try {
			let rst = yield Promise.all(Array.from(gData.appMap.values()).map(function ({ appId, appName }) {
				return deleteApp({ appId, appName });
			}));
			exitProcess();
			return Promise.resolve(rst);
		} catch (e) {
			exitProcess();
			return Promise.reject('kill failed,', e.stack || e.message || e.msg || e);
		}
	});

	return function kill() {
		return _ref2.apply(this, arguments);
	};
})();

let list = (() => {
	var _ref5 = _asyncToGenerator(function* (param = {}) {
		_logger2.default.debug('app list start, param:', JSON.stringify(param));
		try {
			let infoList = yield info(param);
			if (!Array.isArray(infoList)) {
				infoList = [infoList];
			}
			return Promise.resolve(infoList.map(function ({ appId, appName, status, execMod, createTime, upTime, restarts, childPids }) {
				return {
					id: appId, name: appName, status, mod: execMod,
					createTime, upTime,
					restarts, pids: childPids
				};
			}));
		} catch (e) {
			return Promise.reject(e);
		}

		if (param.appName && param.appName.toLowerCase() === 'all') {
			_logger2.default.debug('[list all app]');
			let rst = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = gData.appMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _ref6 = _step2.value;

					var _ref7 = _slicedToArray(_ref6, 2),
					    appId = _ref7[0],
					    app = _ref7[1];

					rst.push(app.info());
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return Promise.all(rst);
		} else {
			let app = gData.getApp(param);
			if (app && app.info) {
				_logger2.default.debug('[info get app]', app.appId, app.appName, app.status);
				return app.info();
			} else {
				return Promise.reject(ERROR.APP_NOT_FOUND);
			}
		}
	});

	return function list() {
		return _ref5.apply(this, arguments);
	};
})();
////////////////////////


exports.routeClientRequest = routeClientRequest;

var _data = require('./data');

var gData = _interopRequireWildcard(_data);

var _Errors = require('../Errors');

var ERROR = _interopRequireWildcard(_Errors);

var _appManager = require('./appManager');

var appMgr = _interopRequireWildcard(_appManager);

var _logger = require('../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const methodMapForClient = { start, restart, stop, reload, kill, info, list, deleteApp };

function routeClientRequest(clientData) {
	if (clientData && clientData.method && methodMapForClient[clientData.method]) {
		try {
			let param = _extends({ appName: '' }, clientData.params || {});
			return methodMapForClient[clientData.method](param);
		} catch (e) {
			_logger2.default.debug('[daemon api] catched api method error:', e.stack || e.msg || e.message || e);
			return Promise.reject(e);
		}
	} else {
		return Promise.reject(_extends({}, ERROR.APP_PARAM_ERROR, {
			msg: `param [method] not found, ${ clientData && clientData.method || 'lost' }`
		}));
	}
}

function start(param) {
	_logger2.default.debug('[daemon start] start, param:', JSON.stringify(param));
	let app = gData.getApp(param);
	_logger2.default.debug('start get app:', app && app.appId);
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
	_logger2.default.debug('[daemon restart] start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map(app => {
			return app.restart();
		}));
	} else {
		let app = gData.getApp(param);
		_logger2.default.debug('restart get app:', app && app.appId);

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
	_logger2.default.debug('stop app start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map(app => {
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
	_logger2.default.debug('reload app start, param:', JSON.stringify(param));
	if (param.appName.toLowerCase() === 'all') {
		return Promise.all(Array.from(gData.appMap.values()).map(app => {
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

function exitProcess(cb) {
	try {
		gData.rpcServer.send({ code: 0, msg: 'daemon kill complete' });
		gData.rpcServer.close();
		_logger2.default.info('kill daemon done');
		process.nextTick(() => process.exit(0));
		cb && cb();
	} catch (e) {
		_logger2.default.error(e.stack || e.message);
	}
}

function info(param = {}) {
	_logger2.default.debug('app info start, param:', JSON.stringify(param));
	if (param.appName && param.appName.toLowerCase() === 'all') {
		_logger2.default.debug('[info all app]');
		let rst = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = gData.appMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _ref3 = _step.value;

				var _ref4 = _slicedToArray(_ref3, 2),
				    appId = _ref4[0],
				    app = _ref4[1];

				rst.push(app.info());
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

		return Promise.all(rst);
	} else {
		let app = gData.getApp(param);
		if (app && app.info) {
			_logger2.default.debug('[info get app]', app.appId, app.appName, app.status);
			return app.info();
		} else {
			return Promise.reject(ERROR.APP_NOT_FOUND);
		}
	}
}