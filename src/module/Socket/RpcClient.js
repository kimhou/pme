/**
 * @module rpcClient
 * @desc
 * @author Created by kimhou on 2016/11/29
 */
import net from 'net'
import EventEmitter from 'events'

export default class extends EventEmitter {
	constructor() {
		super();
	}

	connect({host, port, path}) {
		return new Promise((resolve, reject)=> {
			try {
				this.client = net.connect({host, port, path}, (e)=> {
					if (e) {
						reject(e);
					} else {
						resolve();
					}
				});
				this.client.on('error', (e)=> {
					reject(e);
				})
			} catch (e) {
				reject(e);
			}
		});
	}

	send(msg) {
		return new Promise((resolve, reject)=> {
			this.client.write(`${JSON.stringify(msg)}\r\n`);
			this.client.on('data', (data)=> {
				try {
					resolve(JSON.parse(data.toString('utf-8')));
				} catch (e) {
					reject(e);
				}
			}).once('end', ()=> {
				this.emit('end');
			}).once('error', (e)=> {
				reject(e);
			});
		});
	}

	close() {
		try {
			this.client.end();
		} catch (e) {
			this.emit('error', e);
		}
		return this;
	}
}