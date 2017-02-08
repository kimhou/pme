/**
 * @module child
 * @desc
 * @author Created by kimhou on 2016/12/12
 */
import cluster from 'cluster'
console.log('isMaster:', cluster.isMaster);
import express from 'express'

const app = express();

app.use((req, res, next)=> {
	let i = 0;
	while (i < 1000) {
		i++;
	}
	console.log(req.url);
	res.end('hello test');
});

app.use((err, req, res, next)=> {
	res.end('error');
});

app.listen(3102, '127.0.0.1', ()=> {
	console.log('listen connected');
});