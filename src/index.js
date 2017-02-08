/**
 * @module index
 * @desc
 * @author Created by kimhou on 2017/1/18
 */
import EventEmitter from 'events'
import * as api from './Api'
import logger from './util/logger'

export default class extends EventEmitter {
	constructor() {
		super();
		this.cwd = process.cwd();
	}

	laugtchApi(method, param, commander) {
		if (api[method] && api[method] instanceof Function) {
			try{
				api[method]({method, param: param == null ? undefined : param, commander});
			}catch (e){
				logger.error('api try error', e.stack);
			}
		} else {
			logger.error(`method not found: <${method}>`);
			this.exit();
		}
	}

	exit() {
		logger.debug('[top exit]');
		process.exit(0);
	}
}