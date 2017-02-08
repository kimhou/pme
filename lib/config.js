"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PME_LOG_FILE_PATH = exports.LOCAL_SOCKECK_FOR_RPC = exports.PME_HOME = undefined;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module config
 * @desc
 * @author Created by kimhou on 2017/1/19
 */
const PME_HOME = exports.PME_HOME = _path2.default.resolve(process.env.HOME, '.pme');
try {
  if (!_fs2.default.existsSync(PME_HOME)) {
    _fs2.default.mkdir(PME_HOME);
  }
} catch (e) {}

const LOCAL_SOCKECK_FOR_RPC = exports.LOCAL_SOCKECK_FOR_RPC = _path2.default.resolve(PME_HOME, "local_rpc.socket");
const PME_LOG_FILE_PATH = exports.PME_LOG_FILE_PATH = _path2.default.resolve(PME_HOME, 'pme.log');