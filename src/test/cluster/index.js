/**
 * @module index
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
import cluster from 'cluster'
import path from 'path'

console.log('isMaster:', cluster.isMaster);

cluster.setupMaster({exec: path.resolve(path.dirname(module.filename), 'container.js')});

new Array(4).fill(true).forEach(()=> {
	let child = cluster.fork({pme_env: JSON.stringify({script: path.resolve(path.dirname(module.filename), 'child.js')})});
	child.on('online', ()=>{
		console.log(child.process.pid, 'is online');
	})
});
