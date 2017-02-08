'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.deleteAll = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @module appMgr
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @desc
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Created by kimhou on 2016/12/6
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


let deleteAll = exports.deleteAll = (() => {
	var _ref5 = _asyncToGenerator(function* () {
		_logger2.default.debug('[appMgr killAll] start', gData.appMap.size);
		try {
			let rst = [];
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = gData.appMap[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _ref6 = _step3.value;

					var _ref7 = _slicedToArray(_ref6, 2),
					    appId = _ref7[0],
					    app = _ref7[1];

					app.stop();
					app.removeAllListeners && app.removeAllListeners();
					rst.push(`app <${ app.appName }> deleted`);
					app = null;
					gData.appMap.delete(appId);
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return Promise.resolve(rst.join('\n'));
		} catch (e) {
			return Promise.reject(e);
		}
	});

	return function deleteAll() {
		return _ref5.apply(this, arguments);
	};
})();

exports.createApp = createApp;
exports.reloadAll = reloadAll;
exports.stopAll = stopAll;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ForkApp = require('./ForkApp');

var _ForkApp2 = _interopRequireDefault(_ForkApp);

var _ClusterApp = require('./ClusterApp');

var _ClusterApp2 = _interopRequireDefault(_ClusterApp);

var _data = require('../data');

var gData = _interopRequireWildcard(_data);

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createApp(config) {
	let app = config.execMod === 'fork' ? new _ForkApp2.default(config) : new _ClusterApp2.default(config);
	return app;
}

function reloadAll() {
	_logger2.default.debug('[appMgr reloadAll] start', gData.appMap.size);
	return new Promise((resolve, reject) => {
		let rst = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = gData.appMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _ref = _step.value;

				var _ref2 = _slicedToArray(_ref, 2),
				    appId = _ref2[0],
				    app = _ref2[1];

				app.reload();
				rst.push({ appName: app.appName, appId, pids: Array.from(app.childListMap.keys()) });
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

		resolve(rst);
	});
}

function stopAll() {
	_logger2.default.debug('[appMgr stopAll] start', gData.appMap.size);
	return new Promise((resolve, reject) => {
		let rst = [];
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = gData.appMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var _ref3 = _step2.value;

				var _ref4 = _slicedToArray(_ref3, 2),
				    appId = _ref4[0],
				    app = _ref4[1];

				rst.push({ appName: app.appName, appId, pids: Array.from(app.childListMap.keys()) });
				app.stop();
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

		resolve(rst);
	});
}