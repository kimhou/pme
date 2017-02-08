'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module logger
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2017/1/18
                                                                                                                                                                                                                                                                   */


var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dateFormat = require('date-format');

var _dateFormat2 = _interopRequireDefault(_dateFormat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TRACE = 'trace',
      DEBUG = 'debug',
      INFO = 'info',
      WARN = 'warn',
      ERROR = 'error';
const LEVEL_LIST = [TRACE, DEBUG, INFO, WARN, ERROR];

class Logger {
	constructor(opts = {}) {
		console.log(JSON.stringify({ opts }));
		this.level = opts.logLevel || INFO;
		this.catergory = opts.catergory || '';
		this.colorFuncMap = _extends({
			[TRACE]: {
				pre: _chalk2.default.blue,
				body: _chalk2.default.white
			},
			[DEBUG]: {
				pre: _chalk2.default.blue,
				body: _chalk2.default.white
			},
			[INFO]: {
				pre: _chalk2.default.blue,
				body: _chalk2.default.white
			},
			[WARN]: {
				pre: _chalk2.default.blue,
				body: _chalk2.default.orange
			},
			[ERROR]: {
				pre: _chalk2.default.blue,
				body: _chalk2.default.red
			}
		}, opts.colors || {});
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
		msgs = msgs.map(x => typeof x === 'string' ? x : JSON.stringify(x));
		if (LEVEL_LIST.indexOf(this.level) < LEVEL_LIST.indexOf(INFO)) {
			console.log(preColorFunc(`${ (0, _dateFormat2.default)('yyyy-MM-dd hh:mm:ss.ssss') }[${ type }]`), bodyColorFunc(...msgs));
		} else {
			console.log(bodyColorFunc(...msgs));
		}
	}
}

exports.default = new Logger({
	logLevel: process.pme_env && process.pme_env.customConfig && process.pme_env.customConfig.logLevel || INFO
});
module.exports = exports['default'];