/**
 * @module logger
 * @desc
 * @author Created by kimhou on 2017/1/18
 */
import chalk from 'chalk'
import dateFormat from 'date-format'

const TRACE = 'trace',
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error';
const LEVEL_LIST = [TRACE, DEBUG, INFO, WARN, ERROR];

class Logger {
	constructor(opts = {}) {
		console.log(JSON.stringify({opts}));
		this.level = opts.logLevel || INFO;
		this.catergory = opts.catergory || '';
		this.colorFuncMap = {
			[TRACE]: {
				pre: chalk.blue,
				body: chalk.white
			},
			[DEBUG]: {
				pre: chalk.blue,
				body: chalk.white
			},
			[INFO]: {
				pre: chalk.blue,
				body: chalk.white
			},
			[WARN]: {
				pre: chalk.blue,
				body: chalk.orange
			},
			[ERROR]: {
				pre: chalk.blue,
				body: chalk.red
			},
			...(opts.colors || {})
		};
	}

	trace(...msgs) {
		this.print(TRACE, msgs);
	}

	debug(...msgs) {
		this.print(DEBUG, msgs);
	}

	info(...msgs) {
		this.print(INFO, msgs);
	}

	warn(...msgs) {
		this.print(WARN, msgs);
	}

	error(...msgs) {
		this.print(ERROR, msgs);
	}

	print(type, msgs) {
		if (LEVEL_LIST.indexOf(type) < LEVEL_LIST.indexOf(this.level)) {
			return;
		}
		let colorFunc = this.colorFuncMap[type] || this.colorFuncMap[TRACE],
			preColorFunc = colorFunc.pre,
			bodyColorFunc = colorFunc.body;
		msgs = msgs.map(x=>typeof x === 'string' ? x : JSON.stringify(x));
		if (LEVEL_LIST.indexOf(this.level) < LEVEL_LIST.indexOf(INFO)) {
			console.log(preColorFunc(`${dateFormat('yyyy-MM-dd hh:mm:ss.ssss')}[${type}]`), bodyColorFunc(...msgs));
		} else {
			console.log(bodyColorFunc(...msgs));
		}
	}
}

export default new Logger(({
	logLevel: process.pme_env && process.pme_env.customConfig && process.pme_env.customConfig.logLevel || INFO
}));