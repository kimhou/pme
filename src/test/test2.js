/**
 * @module test
 * @desc
 * @author Created by kimhou on 2016/11/28
 */
import express from 'express'

const app = express();

app.use((req, res, next)=> {
	res.end('hello test2');
});

app.use((err, req, res, next)=> {
	res.end('error');
});

app.listen(3102);