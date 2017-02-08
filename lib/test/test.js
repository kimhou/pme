'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express2.default)(); /**
                                       * @module test
                                       * @desc
                                       * @author Created by kimhou on 2016/11/28
                                       */


app.use((req, res, next) => {
	console.log(req.url);
	res.end('hello test');
});

app.use((err, req, res, next) => {});

const server = app.listen(3101, '127.0.0.1', () => {
	console.log('listen connected');
});

process.on('message', msg => {
	if (msg === 'shutdown') {
		server.close();
		setTimeout(() => {
			process.exit(0);
		}, 500);
	}
});