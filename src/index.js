/**
 * @module index
 * @desc
 * @author Created by kimhou on 2017/1/18
 */
import Client from '../Client'
import EventEmitter from 'events'
import Api from './Api'
import logger from './util/logger'

export default class extends EventEmitter {
	constructor() {
		super();
		this.cwd = process.cwd();
		this.client = new Client();
		this.api = new Api({client: this.client});
	}

	laugtchApi(method, param, commander) {
		if (this.api && this.api[method] && this.api[method] instanceof Function) {
			this.api[method]({method, param: param == null ? undefined : param, commander});
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