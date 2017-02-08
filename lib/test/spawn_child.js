'use strict';

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('message', msg => {
	console.log('child on message', msg);
}); /**
     * @module spawn_child
     * @desc
     * @author Created by kimhou on 2016/11/30
     */

let i = 0;
setInterval(() => {
	process.send && process.send('hello, Im child ' + i++);
}, 5000);

let server = _net2.default.createServer(socket => {
	socket.on('end', () => {
		console.log('net end');
	});
});
server.listen(3023, () => {
	console.log('net listen begin 12705');
});

process.on('uncaughtException', e => {
	console.error(e.message || e);
});