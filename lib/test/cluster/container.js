'use strict';

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('isMaster:', _cluster2.default.isMaster); /**
                                                       * @module container
                                                       * @desc
                                                       * @author Created by kimhou on 2016/12/12
                                                       */

console.log('pme_env', process.env.pme_env);
console.log('argvs:', process.node_args);

process.pme_env = process.env.pme_env && JSON.parse(process.env.pme_env) || {};

process.title = `pme -> ${ process.pme_env.script }`;

require('module')._load(process.pme_env.script);