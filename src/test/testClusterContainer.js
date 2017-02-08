/**
 * @module testClusterContainer
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
import cluster from 'cluster'
import path from 'path'

const ctn = path.resolve(__dirname, '../main/Daemon/appManager/ProcessClusterContainer.js');

console.log(ctn);

cluster.setupMaster({
	exec: ctn
});
const env = {
	pme_env_script: path.resolve(path.dirname(module.filename), 'test.js')
};
let child = cluster.fork({pme_env: JSON.stringify(env)});
child.once('error', (e) => {
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