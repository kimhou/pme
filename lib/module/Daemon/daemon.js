'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.initDaemonRpcServer = initDaemonRpcServer;

var _logger = require('../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _RpcServer = require('../Socket/RpcServer');

var _RpcServer2 = _interopRequireDefault(_RpcServer);

var _config = require('../../config');

var config = _interopRequireWildcard(_config);

var _api = require('./api');

var api = _interopRequireWildcard(_api);

var _data = require('./data');

var gData = _interopRequireWildcard(_data);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initDaemonRpcServer() {
	_logger2.default.debug('init daemon local rpc server start');
	const server = new _RpcServer2.default().listen({ path: config.LOCAL_SOCKECK_FOR_RPC });
	server.on('getSocket', socket => {
		_logger2.default.info('[daemon rpc server on client file socket connected]');
	}).on('data', data => {
		dealClientReq(data);
	}).on('error', e => {
		_logger2.default.error('[rpcServer on error]', e.stack || e.message || e);
	}).on('connected', () => {
		_logger2.default.debug('daemon local rpc server on connected');
		process.send && process.send('connected');
	}).on('end', () => {
		_logger2.default.debug('[rpc server on end]');
	});

	gData.rpcServer = server;
} /**
   * @module daemon
   * @desc
   * @author Created by kimhou on 2017/2/7
   */

function dealClientReq(data) {
	_logger2.default.info('[rpc server on data]', JSON.stringify(data));
	api.routeClientRequest(data).then(res => {
		let data = res;
		responseToClient({ code: 0, data });
	}).catch(e => {
		responseToClient({ code: e.code || 101, msg: e.stack || e.message || e.msg || e || 'no error msg' });
	});
}

function responseToClient(rst) {
	_logger2.default.debug('send to client:', JSON.stringify(rst));
	gData.rpcServer && gData.rpcServer.send(rst);
}