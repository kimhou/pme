/**
 * @module spawn_main
 * @desc
 * @author Created by kimhou on 2016/11/30
 */
import path from 'path'
import fs from 'fs'


const child = require('child_process').spawn('node', [path.resolve(__dirname, 'spawn_child.js')], {
	detached: true,
	stdio: ['ipc']
});
child.stdout.on('data', (data)=> {
	console.log('stdout:' + data.toString());
});
child.stderr.on('data', (data)=> {
	console.log('stderr:', data.toString());
})
child.on('message', (msg)=> {
	console.log('main on message', msg);
}).on('exit', (code)=> {
	console.log('main on child exit', code);
});
child.send('hello child!');
