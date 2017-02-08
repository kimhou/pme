'use strict';

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module local-socket-client
 * @desc
 * @author Created by kimhou on 2017/2/7
 */
const client = _net2.default.connect(_path2.default.resolve(process.env.HOME, '.test/test.socket'), e => {
	console.log('client connect', e);
	if (!e) {
		client.write('im client');
	}
});

client.on('error', e => {
	console.log('client on error', e);
}).on('data', d => {
	console.log('client on data', d.toString());
});