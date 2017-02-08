'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let opts = {
	method: 'POST',
	port: 3101,
	host: '127.0.0.1',
	path: 'http://aabbcc/'
}; /**
    * @module req
    * @desc
    * @author Created by kimhou on 2016/12/7
    */


console.log('start req', JSON.stringify(opts));
let req = _http2.default.request(opts);
req.on('response', res => {
	res.on('data', d => {
		console.log('ondata:', d.toString('utf-8'));
	});
	res.on('end', () => {
		console.log('end');
	});
});
req.on('error', e => {
	console.log(e.message);
});
req.write('heelo');
req.end();
setTimeout(() => {
	console.log('timeout');
}, 5000);