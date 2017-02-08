/**
 * @module container
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
import cluster from 'cluster'

console.log('isMaster:', cluster.isMaster);
console.log('pme_env', process.env.pme_env);
console.log('argvs:', process.node_args);

process.pme_env = process.env.pme_env && JSON.parse(process.env.pme_env) || {};

process.title = `pme -> ${process.pme_env.script}`;

require('module')._load(process.pme_env.script);