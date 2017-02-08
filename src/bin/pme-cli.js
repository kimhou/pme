#!/usr/bin/env node

import commander from 'commander'
import pkg from '../../package.json'

commander.version(pkg.version)
	.option('-v --version', 'get version')
	.option('--debug', 'open debug mod')
	.option('-i --instances <number>', 'process count for cluster mod')
	.option('-e --env <string>', 'app NODE_ENV param')
	.usage('[cmd] app')
	.parse(process.argv);

const customConfig = {
	logLevel: 'info',
	nodePath: process.execPath,
	dashboardServer: {open: false},
	...(pkg.pme || {})
};
if (commander.debug) {
	customConfig.logLevel = 'trace';
}

process.pme_env = {
	exec_path: pkg.pem || process.execPath,
	cwd: process.cwd(),
	debug: commander.debug,
	customConfig
}

const logger = require('../util/logger');
const Top = require('../index');
const top = new Top();

logger.debug(JSON.stringify({pme_env: process.pme_env}));

logger.info(`pme version ${pkg.version}`);

commander.command('start <file|appName|appId|all>')
	.description('launch start')
	.action(function (app) {
		top.laugtchApi('start', app, commander);
	});
commander.command('restart [target]')
	.description('launch restart')
	.action(function (app = 'all') {
		top.laugtchApi('restart', app, commander);
	});
commander.command('stop [target]')
	.description('launch stop')
	.action((app = 'all')=> {
		top.laugtchApi('stop', app, commander);
	})
commander.command('reload [appName|appId|all]')
	.description('launch reload')
	.action((app = 'all')=> {
		top.laugtchApi('reload', app, commander);
	});
commander.command('delete <appName|appId|all>')
	.description('launch delete')
	.alias('del')
	.action((app = 'all')=> {
		top.laugtchApi('deleteApp', app, commander);
	});

commander.command('kill')
	.description('launch kill')
	.action(()=> {
		top.laugtchApi('kill', null, commander);
	});
commander.command('list [appName|appId]')
	.alias('ls')
	.description('launch list')
	.action(function (app = 'all') {
		top.laugtchApi('list', app, commander);
	});
commander.command('info [appName|appId]')
	.description('launch info')
	.action(function (app = 'all') {
		top.laugtchApi('info', app, commander);
	});
commander.command('monit')
	.alias('m')
	.description('launch monitoring')
	.action(function (param) {
		top.laugtchApi('monit', param, commander);
	});
commander.command('log')
	.alias('l')
	.description('launch logging')
	.action(function (cmd) {
		top.laugtchApi('log', cmd, commander);
	});
commander.command('*')
	.action(function () {
		logger.error('Command not found');
		commander.outputHelp();
		process.exit(0);
	});

if (process.argv.length == 2) {
	commander.parse(process.argv);
	commander.outputHelp();
	process.exit(0);
}

commander.parse(process.argv);