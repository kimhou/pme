/**
 * @module local-socket
 * @desc
 * @author Created by kimhou on 2017/2/7
 */

import net from "net"
import path from "path"
import fs from "fs"

const socketFile = path.resolve(process.env.HOME, '.test/test.socket');
if(fs.existsSync(socketFile)){
	fs.remo
}


const server = net.createServer((connect)=> {
	console.log('client connected');
	connect.on('end', ()=> {
		console.log('local connect end');
	});
	connect.write('hello, you connected');
	connect.pipe(connect);
	connect.on('data', (d)=> {
		console.log('on data:', d.toString());
		connect.write('response :' + d.toString());
		connect.pipe(connect);
	})
});

server.listen(socketFile, (e)=> {
	console.log('on listen', e);
});

server.on('error', (e)=> {
	console.log('server on error', e);
})