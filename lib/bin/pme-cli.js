#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).option('-v --version', 'get version').option('--debug', 'open debug mod').option('-i --instances <number>', 'process count for cluster mod').option('-e --env <string>', 'app NODE_ENV param').usage('[cmd] app').parse(process.argv);

const customConfig = _extends({
	logLevel: 'info',
	nodePath: process.execPath,
	dashboardServer: { open: false }
}, _package2.default.pme || {});
if (_commander2.default.debug) {
	customConfig.logLevel = 'trace';
}

process.pme_env = {
	exec_path: _package2.default.pem || process.execPath,
	cwd: process.cwd(),
	debug: _commander2.default.debug,
	customConfig
};

const logger = require('../util/logger');
const Top = require('../index');
const top = new Top();

logger.debug(JSON.stringify({ pme_env: process.pme_env }));

logger.info(`pme version ${ _package2.default.version }`);

_commander2.default.command('start <file|appName|appId|all>').description('launch start').action(function (app) {
	top.laugtchApi('start', app, _commander2.default);
});
_commander2.default.command('restart [target]').description('launch restart').action(function (app = 'all') {
	top.laugtchApi('restart', app, _commander2.default);
});
_commander2.default.command('stop [target]').description('launch stop').action((app = 'all') => {
	top.laugtchApi('stop', app, _commander2.default);
});
_commander2.default.command('reload [appName|appId|all]').description('launch reload').action((app = 'all') => {
	top.laugtchApi('reload', app, _commander2.default);
});
_commander2.default.command('delete <appName|appId|all>').description('launch delete').alias('del').action((app = 'all') => {
	top.laugtchApi('deleteApp', app, _commander2.default);
});

_commander2.default.command('kill').description('launch kill').action(() => {
	top.laugtchApi('kill', null, _commander2.default);
});
_commander2.default.command('list [appName|appId]').alias('ls').description('launch list').action(function (app = 'all') {
	top.laugtchApi('list', app, _commander2.default);
});
_commander2.default.command('info [appName|appId]').description('launch info').action(function (app = 'all') {
	top.laugtchApi('info', app, _commander2.default);
});
_commander2.default.command('monit').alias('m').description('launch monitoring').action(function (param) {
	top.laugtchApi('monit', param, _commander2.default);
});
_commander2.default.command('log').alias('l').description('launch logging').action(function (cmd) {
	top.laugtchApi('log', cmd, _commander2.default);
});
_commander2.default.command('*').action(function () {
	logger.error('Command not found');
	_commander2.default.outputHelp();
	process.exit(0);
});

if (process.argv.length == 2) {
	_commander2.default.parse(process.argv);
	_commander2.default.outputHelp();
	process.exit(0);
}

_commander2.default.parse(process.argv);