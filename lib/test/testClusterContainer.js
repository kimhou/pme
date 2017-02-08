'use strict';

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module testClusterContainer
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
const ctn = _path2.default.resolve(__dirname, '../main/Daemon/appManager/ProcessClusterContainer.js');

console.log(ctn);

_cluster2.default.setupMaster({
	exec: ctn
});
const env = {
	pme_env_script: _path2.default.resolve(_path2.default.dirname(module.filename), 'test.js')
};
let child = _cluster2.default.fork({ pme_env: JSON.stringify(env) });
child.once('error', e => {
	console.log('error', e);
});

child.once('disconnect', () => {
	console.log('disconnect');
});

child.once('exit', (code, signal) => {
	console.log('exit', code, signal);
});

child.once('online', () => {
	console.log('online');
});