'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module spawn_main
 * @desc
 * @author Created by kimhou on 2016/11/30
 */
const child = require('child_process').spawn('node', [_path2.default.resolve(__dirname, 'spawn_child.js')], {
	detached: true,
	stdio: ['ipc']
});
child.stdout.on('data', data => {
	console.log('stdout:' + data.toString());
});
child.stderr.on('data', data => {
	console.log('stderr:', data.toString());
});
child.on('message', msg => {
	console.log('main on message', msg);
}).on('exit', code => {
	console.log('main on child exit', code);
});
child.send('hello child!');