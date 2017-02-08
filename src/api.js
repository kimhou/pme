/**
 * @module api
 * @desc
 * @author Created by kimhou on 2017/1/19
 */
import path from 'path'
import fs from 'fs'
import logger from './util/logger'
import Client from './module/Client'

export function start({method, param, commander}) {
	logger.debug('[top api start]', {method, param});

	const params = getAppParam({param, commander});
	if (params) {
		createClient().then((client)=> {
			client.execRemote('start', params).then((rst)=> {
				printResult(null, rst, {method, param, commander});
				this.list({method: 'list', param, commander});
			}).catch((e)=> {
				printResult(e, null, {method, param, commander});
			});
		}).catch(e=> {
			printResult(e, null, {method, param, commander});
		});
	} else {
		printResult(null, 'param error', {method, param, commander});
	}
}

function createClient() {
	const client = new Client();
	return new Promise((resolve, reject)=> {
		client.connect().then(()=> {
			resolve(client);
		}).catch(e=> {
			reject(e);
		});
	});
}


function getAppParam({param, commander}) {
	let params = {
		instances: commander.instances,
		env: commander.env
	};
	let app = Array.isArray(param) ? param && param.length && param.join(',') : param;
	if (!app) {
		logger.error('app param error, need target!');
		return;
	}
	try {
		if (app.indexOf('.json') !== -1 || app.indexOf('.js') !== -1) {
			app = path.resolve(process.cwd(), app);
			if (!fs.existsSync(app)) {
				logger.error(`file not found:<${app}>`);
				return;
			}
			if (app.indexOf('.json') !== -1) {
				params = {
					...params,
					...require(app)
				};
				if (!params.script) {
					logger.error('json file need param: <script:"your app entry file">');
					return;
				}
			} else {
				params = {
					...params,
					script: app
				}
			}
			params.appName = commander.appName || params.appName;
			if (!params.appName) {
				let name = params.script.match(/\/([^/]+)\.js/i);
				params.appName = name && name.length > 1 && name[1];
			}
		} else {
			if (isNumber(app)) {
				params.appId = app;
			} else {
				params.appName = app;
			}
		}
		return params;
	} catch (e) {
		logger.error(e.stack);
	}
}

function printResult(err, result = {}, {method, param = '', commander, isTable}) {
	if (err) {
		logger.error(
			`
pme ${method} ${param} | failed
=============================
${err.stack || err.message || err.msg || JSON.stringify(err)}
`
		);
	} else if (result.code == 0) {
		logger.success(`
pme ${method} ${param} | success
=============================
${result.data || ''}
`);
	} else {
		logger.error(`
pme ${method} ${param} | failed
=============================
${JSON.stringify(result.msg || result.message)}
${JSON.stringify({param})}
`);
	}
}