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
 * @module rpcClient
 * @desc
 * @author Created by kimhou on 2016/11/29
 */
exports.default = class extends _events2.default {
	constructor() {
		super();
	}

	connect({ host, port, path }) {
		return new Promise((resolve, reject) => {
			try {
				this.client = _net2.default.connect({ host, port, path }, e => {
					if (e) {
						reject(e);
					} else {
						resolve();
					}
				});
				this.client.on('error', e => {
					reject(e);
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	send(msg) {
		return new Promise((resolve, reject) => {
			this.client.write(`${ JSON.stringify(msg) }\r\n`);
			this.client.on('data', data => {
				try {
					resolve(JSON.parse(data.toString('utf-8')));
				} catch (e) {
					reject(e);
				}
			}).once('end', () => {
				this.emit('end');
			}).once('error', e => {
				reject(e);
			});
		});
	}

	close() {
		try {
			this.client.end();
		} catch (e) {
			this.emit('error', e);
		}
		return this;
	}
};
module.exports = exports['default'];