/**
 * @module ProcessClusterContainer
 * @desc
 * @author Created by kimhou on 2016/12/8
 */
import * as ERROR from '../../Errors'
import logger from '../../../util/logger'

try {
	const pme_env = JSON.parse(process.env.pme_env);
	logger.debug('[ProcessClusterContainer start]', JSON.stringify(pme_env));

	if (pme_env.pme_env_script) {
		process.title = 'pme:cluster ->' + pme_env.pme_env_script;
		process.chdir(pme_env.pme_env_cwd || process.env.PWD || path.dirname(pme_env.pme_env_script));
		process.pme_env = pme_env;
		Object.keys(pme_env).forEach(key=> {
			process.env[key] = pme_env[key];
		});

		require('module')._load(pme_env.pme_env_script, null, true);
	} else {
		throw new Error('params [script] is not found!');
	}
} catch (e) {
	logger.error('[ProcessClusterContainer try error]', e.message);
	exitWithError({...ERROR.CODE_UNCAUGHTEXCEPTION, emsg: e.stack || e.message});
}


process.on('uncaughtException', getUncaughtExceptionListener('uncaughtException'));
process.on('unhandledRejection', getUncaughtExceptionListener('unhandledRejection'));

function getUncaughtExceptionListener(listener) {
	return function uncaughtListener(err) {
		var error = err && err.stack ? err.stack : err;

		if (listener === 'unhandledRejection') {
			error = 'You have triggered an unhandledRejection, you may have forgotten to catch a Promise rejection:\n' + error;
		}

		logger.error(error);
		exitWithError(ERROR.CODE_UNCAUGHTEXCEPTION);
	}
}

function exitWithError(err) {
	try {
		process.send(err);
		process.emit('disconnect');
		process.exit(err.code);
	} catch (e) {
		logger.error('[exitWithError] try error ', e.stack || e);
	}
}


