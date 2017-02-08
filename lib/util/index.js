'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @module index
                                                                                                                                                                                                                                                                   * @desc
                                                                                                                                                                                                                                                                   * @author Created by kimhou on 2016/11/28
                                                                                                                                                                                                                                                                   */


exports.getConfigType = getConfigType;
exports.isNumber = isNumber;
exports.transTableString = transTableString;

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConfigType(target) {
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

function isNumber(val = '') {
	return !isNaN(parseFloat(val)) && isFinite(val);
}

function transTableString(list = [], opts = {}) {
	if (Array.isArray(list) && list.length) {
		let keys = Object.keys(list[0]);
		let table = new _cliTable2.default(_extends({
			head: keys
		}, opts));
		list.forEach(x => table.push(keys.map(o => typeof x[o] === 'string' ? x[o] : JSON.stringify(x[o]))));
		return table.toString();
	}
}