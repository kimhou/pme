/**
 * @module config
 * @desc
 * @author Created by kimhou on 2017/1/19
 */
import path from "path"
import fs from "fs"

export const PME_HOME = path.resolve(process.env.HOME, '.pme');
try {
	if (!fs.existsSync(PME_HOME)) {
		fs.mkdir(PME_HOME);
	}
} catch (e) {
}

export const LOCAL_SOCKECK_FOR_RPC = path.resolve(PME_HOME, "local_rpc.socket");
export const PME_LOG_FILE_PATH = path.resolve(PME_HOME, 'pme.log');

