/**
 * @module index
 * @desc
 * @author Created by kimhou on 2016/11/28
 */
import Table from 'cli-table2'

export function getConfigType(target) {
	if (typeof target === 'string') {
		if (target.indexOf('.json') !== -1) {
			return 'json';
		} else if (target.indexOf('.js') !== -1) {
			return 'js';
		}
	} else if (typeof target === 'object') {
		return 'object';
	} else {
		return null;
	}
}

export function isNumber(val = '') {
	return !isNaN(parseFloat(val)) && isFinite(val);
}

export function transTableString(list = [], opts = {}) {
	if (Array.isArray(list) && list.length) {
		let keys = Object.keys(list[0]);
		let table = new Table({
			head: keys,
			...opts
		});
		list.forEach(x=>table.push(keys.map(o=>typeof x[o] === 'string' ? x[o] : JSON.stringify(x[o]))));
		return table.toString();
	}
}