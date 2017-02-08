/**
 * @module test
 * @desc
 * @author Created by kimhou on 2016/11/28
 */
import express from 'express'

const app = express();

app.use((req, res, next)=> {
	console.log(req.url);
	res.end('hello test');
});

app.use((err, req, res, next)=> {

});

const server = app.listen(3101, '127.0.0.1', ()=> {
	console.log('listen connected');
});

process.on('message', (msg)=> {
	if (msg === 'shutdown') {
		server.close();
		setTimeout(()=> {
			process.exit(0);
		}, 500);
	}
})
