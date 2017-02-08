'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module ProcessClusterContainer
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/12/8
                                                                                                                                                                                                                                                                   */


var _Errors = require('../../Errors');

var ERROR = _interopRequireWildcard(_Errors);

var _logger = require('../../../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

try {
	const pme_env = JSON.parse(process.env.pme_env);
	_logger2.default.debug('[ProcessClusterContainer start]', JSON.stringify(pme_env));

	if (pme_env.pme_env_script) {
		process.title = 'pme:cluster ->' + pme_env.pme_env_script;
		process.chdir(pme_env.pme_env_cwd || process.env.PWD || path.dirname(pme_env.pme_env_script));
		process.pme_env = pme_env;
		Object.keys(pme_env).forEach(key => {
			process.env[key] = pme_env[key];
		});

		require('module')._load(pme_env.pme_env_script, null, true);
	} else {
		throw new Error('params [script] is not found!');
	}
} catch (e) {
	_logger2.default.error('[ProcessClusterContainer try error]', e.message);
	exitWithError(_extends({}, ERROR.CODE_UNCAUGHTEXCEPTION, { emsg: e.stack || e.message }));
}

process.on('uncaughtException', getUncaughtExceptionListener('uncaughtException'));
process.on('unhandledRejection', getUncaughtExceptionListener('unhandledRejection'));

function getUncaughtExceptionListener(listener) {
	return function uncaughtListener(err) {
		var error = err && err.stack ? err.stack : err;

		if (listener === 'unhandledRejection') {
			error = 'You have triggered an unhandledRejection, you may have forgotten to catch a Promise rejection:\n' + error;
		}

		_logger2.default.error(error);
		exitWithError(ERROR.CODE_UNCAUGHTEXCEPTION);
	};
}

function exitWithError(err) {
	try {
		process.send(err);
		process.emit('disconnect');
		process.exit(err.code);
	} catch (e) {
		_logger2.default.error('[exitWithError] try error ', e.stack || e);
	}
}