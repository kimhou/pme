/**
 * @module Client
 * @desc
 * @author Created by kimhou on 2016/11/28
 */
import path from 'path'
import fs from 'fs'
import RpcClient from '../Socket/RpcClient'
import EventEmitter from 'events'
import logger from "../../util/logger"
import * as config from '../../config'

const pmeEnv = process.pme_env || {},
	{exec_path} = pmeEnv;


class Client extends EventEmitter {
	static requestTimeout = 6000;

	constructor() {
		super();
	}

	connect() {
		return new Promise((resolve, reject)=> {
			this.pingDaemon()
				.then(()=> {
					logger.debug('daemon is alive');
					resolve();
				})
				.catch((e)=> {
					logger.debug('daemon is not alive, launch it!');
					this.startDaemon()
						.then(()=> {
							logger.debug('[client start daemon success]');
							resolve();
						})
						.catch((e)=> {
							logger.error('[client start daemon error]', e.message || e)
							reject(e);
						});
				});
		});
	}

	execRemote = (method, params)=> {
		if (!method) {
			return Promise.reject(new Error('method not found'));
		}
		logger.debug('[exec remote start]', JSON.stringify({method, params}));

		return new Promise(async(resolve, reject)=> {
			let client;
			let timeout = setTimeout(()=> {
				reject('time out');
				try {
					client && client.close();
				} catch (e) {
				}
			}, Client.requestTimeout);

			try {
				client = await this.createClient();
			} catch (e) {
				logger.error('client create error');
				return reject(e);
			}
			let data = await client.send({method, params}) || {};
			logger.debug('[client rpc on data]', JSON.stringify(data));
			clearTimeout(timeout);
			if (data.code == 0) {
				resolve(data);
			} else {
				reject({
					code: data.code || 101,
					message: data.stack || data.message || data.msg || data || 'none error msg'
				});
			}
			client.close();
		});
	}

	createClient() {
		return new Promise((resolve, reject)=> {
			logger.debug('create rpc client start');
			const client = new RpcClient();
			client.connect({path: config.LOCAL_SOCKECK_FOR_RPC})
				.then(()=> {
					logger.debug('rpc client connected');
					resolve(client);
				})
				.catch(e=> {
					reject(e);
				});
		});
	}

	pingDaemon = async()=> {
		logger.debug('[Client start ping daemon]');
		try {
			logger.debug(`[pingDaemon] start connect`);
			const client = await this.createClient();
			logger.debug('ping rpc server success');
			client.close();
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}

	startDaemon() {
		logger.debug('[client start daemon]');
		return new Promise((resolve, reject)=> {
			try {
				let out, err;
				if (false && pmeEnv.debug) {
					out = 1;
					err = 2;
				} else {
					try {
						out = fs.openSync(config.PME_LOG_FILE_PATH, 'a');
						err = fs.openSync(config.PME_LOG_FILE_PATH, 'a');
					} catch (e) {
						logger.error(e);
					}
				}

				let node_args = [
					path.resolve(path.dirname(module.filename), '../Daemon/index.js')
				];
				logger.debug('[client start daemon]', JSON.stringify({
					pmeEnv,
					node_args,
					exec_path: exec_path || process.exec_path
				}, true));
				const child = require('child_process').spawn(
					exec_path || process.exec_path,
					node_args,
					{
						detached: true,
						cwd: process.cwd(),
						stdio: ['ipc', out, err],
						env: {
							...process.pme_env,
							HOME: process.env.HOME,
							customConfig: JSON.stringify(process.pme_env.customConfig)
						}
					});
				child.on('exit', (code)=> {
					logger.info('daemon process on exit', code);
				});

				child.send('[client msg] i create you!');

				function onError(e) {
					logger.error('[client start daemon error]', e.message || e);
					reject(e);
				}

				child.once('error', onError);

				child.once('message', function (msg) {
					logger.debug('[Client on message to disconnect ping] msg:', msg);
					child.removeListener('error', onError);
					child.disconnect();
					resolve(child);
				});

				child.unref();
			} catch (e) {
				logger.error('[client start daemon on try error]', e.statck || e.message || e);
			}
		});
	}

}

export default Client;

process.on('uncaughtException', (e)=> {
	logger.error('[client on uncaught exception error]', e.stack);
});