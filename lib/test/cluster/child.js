'use strict';

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('isMaster:', _cluster2.default.isMaster); /**
                                                       * @module child
                                                       * @desc
                                                       * @author Created by kimhou on 2016/12/12
                                                       */


const app = (0, _express2.default)();

app.use((req, res, next) => {
	let i = 0;
	while (i < 1000) {
		i++;
	}
	console.log(req.url);
	res.end('hello test');
});

app.use((err, req, res, next) => {
	res.end('error');
});

app.listen(3102, '127.0.0.1', () => {
	console.log('listen connected');
});