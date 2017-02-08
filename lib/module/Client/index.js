'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _RpcClient = require('../Socket/RpcClient');

var _RpcClient2 = _interopRequireDefault(_RpcClient);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _logger = require('../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('../../config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @module Client
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @desc
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @author Created by kimhou on 2016/11/28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


const pmeEnv = process.pme_env || {},
      exec_path = pmeEnv.exec_path;


class Client extends _events2.default {

	constructor() {
		var _this;

		_this = super();

		this.execRemote = (method, params) => {
			if (!method) {
				return Promise.reject(new Error('method not found'));
			}
			_logger2.default.debug('[exec remote start]', JSON.stringify({ method, params }));

			return new Promise((() => {
				var _ref = _asyncToGenerator(function* (resolve, reject) {
					let client;
					let timeout = setTimeout(function () {
						reject('time out');
						try {
							client && client.close();
						} catch (e) {}
					}, Client.requestTimeout);

					try {
						client = yield _this.createClient();
					} catch (e) {
						_logger2.default.error('client create error');
						return reject(e);
					}
					let data = (yield client.send({ method, params })) || {};
					_logger2.default.debug('[client rpc on data]', JSON.stringify(data));
					clearTimeout(timeout);
					if (data.code == 0) {
						resolve(data);
					} else {
						reject({
							code: data.code || 101,
							message: data.stack || data.message || data.msg || data || 'none error msg'
						});
					}
					client.close();
				});

				return function (_x, _x2) {
					return _ref.apply(this, arguments);
				};
			})());
		};

		this.pingDaemon = _asyncToGenerator(function* () {
			_logger2.default.debug('[Client start ping daemon]');
			try {
				_logger2.default.debug(`[pingDaemon] start connect`);
				const client = yield _this.createClient();
				_logger2.default.debug('ping rpc server success');
				client.close();
				return Promise.resolve();
			} catch (e) {
				return Promise.reject(e);
			}
		});
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.pingDaemon().then(() => {
				_logger2.default.debug('daemon is alive');
				resolve();
			}).catch(e => {
				_logger2.default.debug('daemon is not alive, launch it!');
				this.startDaemon().then(() => {
					_logger2.default.debug('[client start daemon success]');
					resolve();
				}).catch(e => {
					_logger2.default.error('[client start daemon error]', e.message || e);
					reject(e);
				});
			});
		});
	}

	createClient() {
		return new Promise((resolve, reject) => {
			_logger2.default.debug('create rpc client start');
			const client = new _RpcClient2.default();
			client.connect({ path: config.LOCAL_SOCKECK_FOR_RPC }).then(() => {
				_logger2.default.debug('rpc client connected');
				resolve(client);
			}).catch(e => {
				reject(e);
			});
		});
	}

	startDaemon() {
		_logger2.default.debug('[client start daemon]');
		return new Promise((resolve, reject) => {
			try {
				let out, err;
				if (false && pmeEnv.debug) {
					out = 1;
					err = 2;
				} else {
					try {
						out = _fs2.default.openSync(config.PME_LOG_FILE_PATH, 'a');
						err = _fs2.default.openSync(config.PME_LOG_FILE_PATH, 'a');
					} catch (e) {
						_logger2.default.error(e);
					}
				}

				let node_args = [_path2.default.resolve(_path2.default.dirname(module.filename), '../Daemon/index.js')];
				_logger2.default.debug('[client start daemon]', JSON.stringify({
					pmeEnv,
					node_args,
					exec_path: exec_path || process.exec_path
				}, true));
				const child = require('child_process').spawn(exec_path || process.exec_path, node_args, {
					detached: true,
					cwd: process.cwd(),
					stdio: ['ipc', out, err],
					env: _extends({}, process.pme_env, {
						HOME: process.env.HOME,
						customConfig: JSON.stringify(process.pme_env.customConfig)
					})
				});
				child.on('exit', code => {
					_logger2.default.info('daemon process on exit', code);
				});

				child.send('[client msg] i create you!');

				function onError(e) {
					_logger2.default.error('[client start daemon error]', e.message || e);
					reject(e);
				}

				child.once('error', onError);

				child.once('message', function (msg) {
					_logger2.default.debug('[Client on message to disconnect ping] msg:', msg);
					child.removeListener('error', onError);
					child.disconnect();
					resolve(child);
				});

				child.unref();
			} catch (e) {
				_logger2.default.error('[client start daemon on try error]', e.statck || e.message || e);
			}
		});
	}

}

Client.requestTimeout = 6000;
exports.default = Client;


process.on('uncaughtException', e => {
	_logger2.default.error('[client on uncaught exception error]', e.stack);
});
module.exports = exports['default'];