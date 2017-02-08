/**
 * @module App
 * @desc
 * @author Created by kimhou on 2016/12/9
 */
import EventEmitter from 'events'
import * as gData from '../data'
import * as APP_STATUS from './AppStatus'
import {isCanStop} from './AppStatus'
import * as proUtil from '../../../util/process'
import async from 'async'
import DateFormat from 'date-format'
import logger from '../../../util/logger'

export default class App extends EventEmitter {
	constructor(appConfig = {}) {
		super();

		this.appConfig = appConfig;

		this.appId = appConfig.appId;
		this.appName = appConfig.appName;
		this.script = appConfig.script;
		this.execMod = appConfig.execMod;
		this.status = APP_STATUS.STATUS_CREATED;
		this.createTime = Date.now();
		this.restarts = 0;
		this.minReloadDuration = 3000;
		this.errRestarts = 0;
		this.childListMap = new Map();
		this.maxRestarts = 3;
		this.stopChildTimeout = 1000;

		gData.appMap.set(this.appId, this);
	}

	updateAppConfig(appConfig = {}) {
		this.appConfig = {
			...this.appConfig,
			appConfig
		}
		this.appName = this.appConfig.appName;
		this.execMod = this.appConfig.execMod;
	}


	restart = async(appConfig)=> {
		if (!APP_STATUS.isCanRestart(this)) {
			return Promise.reject({msg: `app status <${APP_STATUS.STATUS_DESC[this.status]}> can not restart`});
		}
		let oldPids = this.getPids();
		logger.debug(`[${this.appName} restart] start, pids:${oldPids}`);
		this.updateAppConfig(appConfig);
		this.status = APP_STATUS.STATUS_RESTARTING;
		this.errRestarts = 0;
		this.restarts++;
		try {
			await this.stopAllChild();
			await this.start();
			return Promise.resolve(`${this.appName} restart done: ${oldPids} => ${this.getPids()}`);
		} catch (e) {
			this.status = APP_STATUS.STATUS_ERROR;
			return Promise.reject(e);
		}
	}

	reload = (appConfig)=> {
		if (!APP_STATUS.isCanReload(this)) {
			return Promise.reject({msg: `app status <${APP_STATUS.STATUS_DESC[this.status]}> can not reload`});
		}

		logger.debug(`[${this.appName} reload start] pids:`, this.childListMap.keys());

		this.updateAppConfig(appConfig);

		return new Promise((resolve, reject)=> {
			if (this.childListMap.size === 0) {
				logger.debug(`[${this.appName} reload] find child size = 0, use start`);
				this.start().then(rst=>resolve(rst)).catch(e=>reject(e));
				return;
			}
			this.restarts++;
			this.status = APP_STATUS.STATUS_RELOADING;

			const oldPids = this.getPids();

			if (this.execMod == 'cluster') {
				const seriesArr = Array.from(this.childListMap.values())
					.map((child)=> (cb)=> {
						try {
							const oldPid = child && child.pid;
							this.childListMap.delete(oldPid);
							this.createChild().then((newChild)=> {
								const newPid = newChild && newChild.pid;
								if (!newPid)return cb(new Error('new pid error'));
								logger.debug(`[${this.appName} reload] new child created`, newPid);
								this.childListMap.set(newPid, newChild);
								this.stopChild(child).then(()=> {
									logger.debug(`[${this.appName} reload] old child stoped`, oldPid);
									cb();
								}).catch(e=> {
									logger.error(`[${this.appName} reload] old child stop on error`, e);
									cb(e);
								});
							}).catch((e)=> {
								logger.error(`[${this.appName} reload] create child on error`, e);
								cb(e);
							});
						} catch (e) {
							logger.error(`[${this.appName} child reload on try catch error]`, e);
							cb(e);
						}
					});
				async.series(seriesArr, (e)=> {
					logger.debug(`[${this.appName} reload] series done, `, e && (e.stack || e.message || e));
					if (e) {
						this.status = APP_STATUS.STATUS_ERROR;
						reject(e);
					} else {
						this.status = APP_STATUS.STATUS_ONLINE;
						resolve(`${this.appName} reload done: ${oldPids.join(',')} => ${this.getPids().join(',')}`);
					}
				});
			} else {
				try {
					for ([pid, child] of this.childListMap) {
						logger.debug(`[${this.appName} reload] kill old child start:`, pid);
						proUtil.killChild(child).then(()=> {
							logger.debug(`[${this.appName} reload] kill old child done:`, pid);
							this.childListMap.clear();
							this.createChild().then(newChild=> {
								const newPid = newChild && newChild.pid;
								if (!newPid)return reject(new Error('new pid error'));
								logger.debug(`[${this.appName} reload] new child create:`, newPid);
								this.childListMap.set(newChild.pid, newChild);
								this.status = APP_STATUS.STATUS_ONLINE;
								resolve(`${this.appName} reload done: ${oldPids.join(',')} => ${this.getPids().join(',')}`);
							}).catch(e=> {
								logger.debug(`[${this.appName} reload] kill old child error:`, pid, e.stack || e.message || e);
								this.status = APP_STATUS.STATUS_ERROR;
								reject(e);
							});
						}).catch(e=> {
							this.status = APP_STATUS.STATUS_ERROR;
							reject(e);
						});
					}
				} catch (e) {
					this.status = APP_STATUS.STATUS_ERROR;
					reject(e);
				}
			}
		});
	}

	stop() {
		if (!isCanStop(this)) {
			return Promise.reject(`app status ${APP_STATUS.STATUS_DESC[this.status]} is not allow stop`);
		}
		return this.stopAllChild();
	}

	stopAllChild() {
		logger.debug(`[${this.appName} stopAllChild] start`, this.childListMap.keys());
		this.status = APP_STATUS.STATUS_STOPPING;

		return new Promise((resolve, reject)=> {
			let pids = Array.from(this.childListMap.keys());
			async.series(
				pids.map((pid)=> {
					return async(cb)=> {
						try {
							const child = this.childListMap.get(pid);
							logger.debug(`[${this.appName} kill pid]`, pid);
							await this.stopChild(child);
							cb();
						} catch (e) {
							logger.error(`[${this.appName} kill pid error]`, JSON.stringify({
								pid,
								msg: e.message || e
							}));
							cb(e);
						}
					}
				})
				, (err)=> {
					if (err) {
						let msg = err.stack || err.message || err;
						logger.error(`[${this.appName} kill all child error]`, msg);
						this.status = APP_STATUS.STATUS_ERROR;
						reject(`${this.appName} stoped error, ${msg}`);
					} else {
						logger.debug(`[${this.appName} kill all child success]`);
						this.status = APP_STATUS.STATUS_OFFLINE;
						this.childListMap.clear();
						resolve(`${this.appName} stoped, pids: ${pids}`);
					}
				});
		});
	}

	info() {
		return Promise.resolve({
			appId: this.appId,
			appName: this.appName,
			status: APP_STATUS.STATUS_DESC[this.status] || 'NONE',
			script: this.script,
			execMod: this.execMod,
			createTime: DateFormat('yyyy-MM-dd hh:mm:ss', new Date(this.createTime)),
			upTime: this.upTime ? DateFormat('yyyy-MM-dd hh:mm:ss', new Date(this.upTime)) : '--',
			restarts: this.restarts,
			childPids: this.getPids()
		});
	}

	initChildListener(child) {
		this.upTime = Date.now();
		child.pid = child.process && child.process.pid;

		if (!(child && child.process && child.process.pid)) {
			logger.debug(`[${this.appName} init child listener passed] error child`);
			return;
		}
		logger.debug(`[${this.appName} init child listener]`, child.process && child.process.pid, child.pid);
		child.on('message', (msg)=> {
			logger.debug(`${this.appName} child on message:`, msg);
		});
		child.once('error', (e) => {
			child.status = APP_STATUS.STATUS_ERROR;
			this.onChildError(child, e);
		});

		child.once('disconnect', () => {
			logger.info(`${this.appName} child disconnect, ${JSON.stringify({appName: this.appName, pid: child.pid})}`);
			child.status = APP_STATUS.STATUS_DISCONNECTED;
		});

		child.once('exit', (code, signal) => {
			child.status = APP_STATUS.STATUS_EXIT;
			this.onChildExit(child, code || 0, signal || 'SIGINT');
		});
	}

	stopChild(child, isForce) {
		return new Promise((resolve, reject)=> {
			const pid = child && child.process && child.process.pid;
			const killProcess = ()=> {
				logger.debug(`[${this.appName} stopChild] forece kill child`, pid);
				proUtil.killChild(child).then(()=>resolve('child stop done:', pid)).catch(e=>reject(e));
			}
			if (pid) {
				logger.debug(`[${this.appName} stop child] start:`, pid);
				try {
					child.removeAllListeners && child.removeAllListeners();
					child.process && child.process.connected && child.send && child.send('shutdown');
				} catch (e) {
					logger.error(`[${this.appName} stop child prepare error]`, e.stack || e.message);
				}
				if (this.execMod === 'cluster') {
					logger.debug(`[${this.appName} stop cluster child], ${JSON.stringify({
						pid: child.pid,
						state: child.state
					})}`,);
					if (child.suicide != true && ['dead', 'disconnected'].indexOf(child.state) == -1) {
						logger.debug(`[${this.appName} child(${child.pid}) is alive, disconnect first`);
						const timeout = setTimeout(()=> {
							logger.debug(`[${this.appName} child(${child.pid}) disconnected timeout`);
							killProcess();
						}, this.stopChildTimeout);
						child.once('disconnected', ()=> {
							logger.debug(`[${this.appName} child(${child.pid}) on disconnected`);
							killProcess();
						});
					} else {
						killProcess();
					}
				} else {
					killProcess();
				}
			} else {
				logger.debug('process is dead, stop child passed!');
				resolve('process is dead');
			}
		});
	}

	onChildError(child, e) {
		logger.error('[App child on error]', e.stack || e.message || e);
		child.status = APP_STATUS.STATUS_ERROR;
		let pid = child.pid;
		proUtil.killChild(child).then(()=>logger.info('error child killed:', pid)).catch(e=>logger.error('error child kill failed:', pid));
		this.autoReload();
	}

	onChildExit(child, code, signal) {
		logger.warn('[App child on exit]', JSON.stringify({
			pid: child && child.process && child.process.pid,
			code,
			signal,
			status: APP_STATUS.STATUS_DESC[child.status]
		}));
		if ([
				APP_STATUS.STATUS_STOPPING,
				APP_STATUS.STATUS_RELOADING,
				APP_STATUS.STATUS_RESTARTING,
				APP_STATUS.STATUS_STARTING
			].indexOf(this.status) === -1) {
			this.autoReload();
		}
	}

	autoReload = () => {
		logger.debug(`[auto reload start] errRestarts: ${this.errRestarts}, maxRestarts: ${this.maxRestarts}`);
		this.reloadTimeout && clearTimeout(this.reloadTimeout);
		let isError;
		if (Date.now() - this.upTime < this.minReloadDuration) {
			isError = true;
		}
		if (this.errRestarts >= this.maxRestarts) {
			this.status = APP_STATUS.STATUS_ERROR;
			logger.error(`app <${this.appName}> on error to retry time maxed`);
			return;
		}
		this.reloadTimeout = setTimeout(()=> {
			logger.debug('reloadTimeout');
			isError && this.errRestarts++;
			this.reload().then((rst)=> {
				logger.info('auto reload done:', rst);
			}).catch(e=> {
				logger.error('auto reload error:', e.stack || e.message || e.msg || e);
			});
		}, this.minReloadDuration);
	}

	getPids() {
		return this.childListMap && Array.from(this.childListMap.keys());
	}

}