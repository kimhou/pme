'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module rpcServer
 * @desc
 * @author Created by kimhou on 2016/11/29
 */
exports.default = class extends _events2.default {
	constructor() {
		super();

		this.serverHandler = socket => {
			this.socket = socket;
			this.emit('getSocket', socket);
			socket.on('end', () => {
				this.emit('end');
			});
			socket.on('data', data => {
				try {
					let d = JSON.parse(data.toString('utf-8'));
					this.emit('data', d);
				} catch (e) {
					this.emit('error', e);
				}
			});
			socket.on('error', e => {
				this.emit('error', e);
			});
			socket.unref();
		};

		this.server = _net2.default.createServer(this.serverHandler);
	}

	listen({ host, port, path, exclusive = true }) {
		try {
			console.log('rpc server start listen ', JSON.stringify({ port, host, path, exclusive }));
			this.server.listen(path, e => {
				if (e) {
					this.emit('error', e);
				} else {
					this.emit('connected');
				}
			});
		} catch (e) {
			this.emit('error', e);
		}
		return this;
	}

	send(data) {
		try {
			this.socket && this.socket.write(JSON.stringify(data));
		} catch (e) {
			this.emit('error', e);
		}
	}

	close() {
		try {
			this.server && this.server.close();
		} catch (e) {
			this.emit('error', e);
		}
	}
};
module.exports = exports['default'];