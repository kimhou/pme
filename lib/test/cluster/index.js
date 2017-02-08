'use strict';

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module index
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
console.log('isMaster:', _cluster2.default.isMaster);

_cluster2.default.setupMaster({ exec: _path2.default.resolve(_path2.default.dirname(module.filename), 'container.js') });

new Array(4).fill(true).forEach(() => {
  let child = _cluster2.default.fork({ pme_env: JSON.stringify({ script: _path2.default.resolve(_path2.default.dirname(module.filename), 'child.js') }) });
  child.on('online', () => {
    console.log(child.process.pid, 'is online');
  });
});