/**
 * @module req
 * @desc
 * @author Created by kimhou on 2016/12/7
 */
import http from 'http'

let opts = {
	method: 'POST',
	port: 3101,
	host: '127.0.0.1',
	path: 'http://aabbcc/'
};

console.log('start req', JSON.stringify(opts));
let req = http.request(opts);
req.on('response', (res)=> {
	res.on('data', (d)=> {
		console.log('ondata:', d.toString('utf-8'));
	})
	res.on('end', ()=> {
		console.log('end');
	})
});
req.on('error', (e)=> {
	console.log(e.message);
});
req.write('heelo');
req.end();
setTimeout(()=>{
	console.log('timeout');
}, 5000)
