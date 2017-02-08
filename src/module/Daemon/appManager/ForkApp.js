/**
 * @module ForkApp
 * @desc
 * @author Created by kimhou on 2016/12/9
 */
import path from 'path'
import App from './App'
import * as APP_STATUS from './AppStatus'
import {isCanStart} from './AppStatus'
import logger from '../../../util/logger'

const spawn = require('child_process').spawn;

export default class ForkApp extends App {
	constructor(appConfig) {
		super(appConfig);
	}

	start = (appConfig)=> {
		this.updateAppConfig(appConfig);
		return new Promise((resolve, reject)=> {
			if (isCanStart(this)) {
				logger.debug('[startForkApp start]');
				this.status = APP_STATUS.STATUS_STARTING;
				this.createChild().then(child=> {
					if (child && child.pid) {
						this.childListMap.set(child.pid, child);
						this.status = APP_STATUS.STATUS_ONLINE;
						return resolve(`app <${this.appName}> start done, pids:${this.getPids()}`);
					} else {
						this.status = APP_STATUS.STATUS_ERROR;
						return reject(`app <${this.appName}> start failed!`);
					}
				}).catch(e=> {
					reject(e);
				});
			} else {
				return reject({
					msg: `app <${this.appName}> status <${APP_STATUS.STATUS_DESC[this.status]}> can not start`
				});
			}
		});
	}

	createChild() {
		const config = this.appConfig,
			pme_env = process.pme_env;
		try {
			if (this.childListMap.size > 0) {
				logger.error('[create child error] fork mod need childList is empty!');
				return Promise.reject(`child is running: ${Array.from(this.childListMap.keys())}`);
			}
			let cmd = pme_env.pme_env_exec_path,
				nodeArgs = [path.resolve(path.dirname(module.filename), 'ProcessForkContainer.js')],
				params = {
					env: {
						...pme_env,
						pme_env_script: config.script
					},
					detached: true,
					cwd: pme_env.pme_env_cwd || process.cwd(),
					stdio: ['pipe', 'pipe', 'pipe', 'ipc']
				};
			logger.debug('[ForkApp create child]', JSON.stringify({cmd, nodeArgs, params, pme_env}));

			const child = spawn(cmd, nodeArgs, params);
			child.process = {pid: child.pid};
			this.initChildListener(child);
			child.stderr.on('data', (data)=> {
				logger.error('[fork child on stderr]');
				this.onChildError(child, data.toString('utf-8'));
			});
			child.unref();
			return Promise.resolve(child);
		} catch (e) {
			return Promise.reject(e);
		}
	}
}