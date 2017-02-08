"use strict";

var _net = require("net");

var _net2 = _interopRequireDefault(_net);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const socketFile = _path2.default.resolve(process.env.HOME, '.test/test.socket'); /**
                                                                                   * @module local-socket
                                                                                   * @desc
                                                                                   * @author Created by kimhou on 2017/2/7
                                                                                   */

if (_fs2.default.existsSync(socketFile)) {
	_fs2.default.remo;
}

const server = _net2.default.createServer(connect => {
	console.log('client connected');
	connect.on('end', () => {
		console.log('local connect end');
	});
	connect.write('hello, you connected');
	connect.pipe(connect);
	connect.on('data', d => {
		console.log('on data:', d.toString());
		connect.write('response :' + d.toString());
		connect.pipe(connect);
	});
});

server.listen(socketFile, e => {
	console.log('on listen', e);
});

server.on('error', e => {
	console.log('server on error', e);
});