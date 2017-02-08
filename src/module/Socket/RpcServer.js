/**
 * @module rpcServer
 * @desc
 * @author Created by kimhou on 2016/11/29
 */
import net from 'net'
import EventEmitter from 'events'

export default class extends EventEmitter {
	constructor() {
		super();
		this.server = net.createServer(this.serverHandler);
	}

	listen({host, port, path, exclusive = true}) {
		try {
			console.log('rpc server start listen ', JSON.stringify({port, host, path, exclusive}));
			this.server.listen(path, (e)=> {
				if (e) {
					this.emit('error', e);
				} else {
					this.emit('connected');
				}
			});
		} catch (e) {
			this.emit('error', e);
		}
		return this;
	}

	serverHandler = (socket)=> {
		this.socket = socket;
		this.emit('getSocket', socket);
		socket.on('end', ()=> {
			this.emit('end');
		});
		socket.on('data', (data)=> {
			try {
				let d = JSON.parse(data.toString('utf-8'));
				this.emit('data', d);
			} catch (e) {
				this.emit('error', e);
			}
		});
		socket.on('error', (e)=> {
			this.emit('error', e);
		});
		socket.unref();
	}

	send(data) {
		try {
			this.socket && this.socket.write(JSON.stringify(data));
		} catch (e) {
			this.emit('error', e);
		}
	}

	close() {
		try {
			this.server && this.server.close();
		} catch (e) {
			this.emit('error', e);
		}
	}
}