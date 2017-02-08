'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

let killChild = exports.killChild = (() => {
	var _ref = _asyncToGenerator(function* (child) {
		if (!child) return reject(new Error('child is empty'));
		try {
			const pid = child.process && child.process.pid;
			child.removeAllListener && child.removeAllListener();
			child.kill();
			yield killProcess(pid);
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	});

	return function killChild(_x) {
		return _ref.apply(this, arguments);
	};
})();

exports.killProcess = killProcess;
exports.processIsDead = processIsDead;
exports.checkProcess = checkProcess;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * @module process
 * @desc
 * @author Created by kimhou on 2016/12/13
 */
function killProcess(pid, signal = 'SIGINT') {
	if (!pid || isNaN(pid)) {
		return Promise.reject(new Error(`pid is error:${ pid }`));
	}
	try {
		process.kill(parseInt(pid, 10), signal);
		return processIsDead(pid);
	} catch (e) {
		if (e.code == 'ESRCH') {
			return Promise.resolve();
		} else {
			return Promise.reject(e);
		}
	}
}

function processIsDead(pid) {
	if (!pid || isNaN(pid)) {
		return Promise.reject(new Error(`pid is error:${ pid }`));
	}
	return new Promise((resolve, reject) => {
		const timer = setInterval(() => {
			if (checkProcess(pid) === false) {
				resolve();
			}
		}, 100);
		const timeout = setTimeout(() => {
			clearInterval(timer);
			try {
				process.kill(parseInt(pid), 'SIGKILL');
				if (checkProcess(pid)) {
					resolve();
				} else {
					reject(new Error(`process ${ pid } can not be killed!`));
				}
			} catch (e) {
				reject(e);
			}
		}, 3000);
	});
}

function checkProcess(pid) {
	if (!pid || isNaN(pid)) {
		return false;
	}
	try {
		process.kill(parseInt(pid), 0);
		return true;
	} catch (err) {
		return false;
	}
};