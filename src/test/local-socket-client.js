/**
 * @module local-socket-client
 * @desc
 * @author Created by kimhou on 2017/2/7
 */
import net from 'net'
import path from 'path'

const client = net.connect(path.resolve(process.env.HOME, '.test/test.socket'), (e)=> {
	console.log('client connect', e);
	if (!e) {
		client.write('im client');
	}
});

client.on('error', (e)=> {
	console.log('client on error', e);
}).on('data', (d)=> {
	console.log('client on data', d.toString());
})
