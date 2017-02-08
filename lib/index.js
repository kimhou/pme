'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _Api = require('./Api');

var api = _interopRequireWildcard(_Api);

var _logger = require('./util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _events2.default {
	constructor() {
		super();
		this.cwd = process.cwd();
	}

	laugtchApi(method, param, commander) {
		if (api[method] && api[method] instanceof Function) {
			try {
				api[method]({ method, param: param == null ? undefined : param, commander });
			} catch (e) {
				_logger2.default.error('api try error', e.stack);
			}
		} else {
			_logger2.default.error(`method not found: <${ method }>`);
			this.exit();
		}
	}

	exit() {
		_logger2.default.debug('[top exit]');
		process.exit(0);
	}
}; /**
    * @module index
    * @desc
    * @author Created by kimhou on 2017/1/18
    */

module.exports = exports['default'];