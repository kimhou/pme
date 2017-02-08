/**
 * @module daemon
 * @desc
 * @author Created by kimhou on 2017/2/7
 */

import logger from "../../util/logger"
import RpcServer from '../Socket/RpcServer'
import * as config from '../../config'
import * as api from './api'
import * as gData from './data'

export function initDaemonRpcServer() {
	logger.debug('init daemon local rpc server start');
	const server = new RpcServer().listen({path: config.LOCAL_SOCKECK_FOR_RPC});
	server
		.on('getSocket', (socket)=> {
			logger.info('[daemon rpc server on client file socket connected]');
		})
		.on('data', (data)=> {
			dealClientReq(data);
		})
		.on('error', (e)=> {
			logger.error('[rpcServer on error]', e.stack || e.message || e);
		})
		.on('connected', ()=> {
			logger.debug('daemon local rpc server on connected');
			process.send && process.send('connected');
		})
		.on('end', ()=> {
			logger.debug('[rpc server on end]');
		});

	gData.rpcServer = server;
}

function dealClientReq(data) {
	logger.info('[rpc server on data]', JSON.stringify(data));
	api.routeClientRequest(data)
		.then((res)=> {
			let data = res;
			responseToClient({code: 0, data})
		})
		.catch((e)=> {
			responseToClient({code: e.code || 101, msg: e.stack || e.message || e.msg || e || 'no error msg'});
		});
}

function responseToClient(rst) {
	logger.debug('send to client:', JSON.stringify(rst));
	gData.rpcServer && gData.rpcServer.send(rst);
}