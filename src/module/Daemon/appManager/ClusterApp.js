/**
 * @module ForkApp
 * @desc
 * @author Created by kimhou on 2016/12/9
 */
import cluster from 'cluster'
import App from './App'
import * as APP_STATUS from './AppStatus'
import {isCanStart, isCanStop, isCanRestart} from './AppStatus'
import async from 'async'
import logger from '../../../util/logger'

export default class ForkApp extends App {
	constructor(appConfig) {
		super(appConfig);
	}

	start = (appConfig)=> {
		this.updateAppConfig(appConfig);
		if (isCanStart(this)) {
			const config = this.appConfig;
			logger.debug('[startClusterApp start]', JSON.stringify(config));
			this.status = APP_STATUS.STATUS_STARTING;
			return new Promise((resolve, reject)=> {
				let count = this.appConfig.instances || 1;
				async.series(new Array(count).fill((cb)=> {
					this.createChild().then(child=> {
						if (child && child.pid) {
							this.childListMap.set(child.pid, child);
							logger.debug('new child created', child.pid);
							cb();
						} else {
							cb(new Error('create child is not alive'));
						}
					}).catch(e=> {
						cb(new Error(e.message || e.msg || e || 'create child error'));
					});
				}), (e, rst)=> {
					if (e) {
						logger.error('[fork child error]', e.message || e);
						this.status = APP_STATUS.STATUS_ERROR;
						reject(e);
					} else {
						logger.debug('[app fork child finished]');
						this.status = APP_STATUS.STATUS_ONLINE;
						resolve(`done, pids:${this.getPids()}`);
					}
				});
			});
		} else {
			return Promise.reject({msg: `app status <${APP_STATUS.STATUS_DESC[this.status]}> can not start`});
		}
	}

	createChild() {
		return new Promise((resolve, reject)=> {
			if (this.childListMap.size > this.instances) {
				logger.debug(`[create child passed] childSize:${this.childListMap.size}, instances: ${this.instances}`);
				return;
			}

			const config = this.appConfig,
				pme_env = process.pme_env;
			let env = {
				...pme_env,
				pme_env_script: config.script,
				pme_env_cwd: pme_env.pme_env_cwd || process.cwd()
			};

			logger.debug('[cluster fork start]', JSON.stringify({env}));
			const child = cluster.fork({pme_env: JSON.stringify(env)});
			this.initChildListener(child);
			let timeout = setTimeout(()=> {
				reject('start time out');
			}, 3000);
			child.once('online', () => {
				logger.debug(`App child online, ${JSON.stringify({
					appName: this.appName,
					pid: child.process && child.process.pid
				})}`);
				child.status = APP_STATUS.STATUS_ONLINE;
				resolve(child);
			});
		});
	}
}