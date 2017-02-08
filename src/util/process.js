/**
 * @module process
 * @desc
 * @author Created by kimhou on 2016/12/13
 */
export function killProcess(pid, signal = 'SIGINT') {
	if (!pid || isNaN(pid)) {
		return Promise.reject(new Error(`pid is error:${pid}`));
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

export function processIsDead(pid) {
	if (!pid || isNaN(pid)) {
		return Promise.reject(new Error(`pid is error:${pid}`));
	}
	return new Promise((resolve, reject)=> {
		const timer = setInterval(()=> {
			if (checkProcess(pid) === false) {
				resolve();
			}
		}, 100);
		const timeout = setTimeout(()=> {
			clearInterval(timer);
			try {
				process.kill(parseInt(pid), 'SIGKILL');
				if (checkProcess(pid)) {
					resolve();
				} else {
					reject(new Error(`process ${pid} can not be killed!`));
				}
			} catch (e) {
				reject(e);
			}
		}, 3000);
	});
}

export function checkProcess(pid) {
	if (!pid || isNaN(pid)) {
		return false;
	}
	try {
		process.kill(parseInt(pid), 0);
		return true;
	}
	catch (err) {
		return false;
	}
};

export async function killChild(child) {
	if (!child)return reject(new Error('child is empty'));
	try {
		const pid = child.process && child.process.pid;
		child.removeAllListener && child.removeAllListener();
		child.kill();
		await killProcess(pid);
		return Promise.resolve();
	} catch (e) {
		return Promise.reject(e);
	}
}