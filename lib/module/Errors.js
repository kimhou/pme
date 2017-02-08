'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module Errors
 * @desc
 * @author Created by kimhou on 2017/2/7
 */
const APP_NOT_FOUND = exports.APP_NOT_FOUND = { code: 101, msg: 'app not found' };
const APP_IS_RUNNING = exports.APP_IS_RUNNING = { code: 102, msg: 'app is running' };
const APP_PARAM_ERROR = exports.APP_PARAM_ERROR = { code: 103, msg: 'app param error' };
const CODE_UNCAUGHTEXCEPTION = exports.CODE_UNCAUGHTEXCEPTION = { code: 104, msg: 'code uncautch exception' };

const PROCESS_EXIT_CODE_SUCCESS = exports.PROCESS_EXIT_CODE_SUCCESS = 0;
const PROCESS_EXIT_CODE_ERROR = exports.PROCESS_EXIT_CODE_ERROR = 1;