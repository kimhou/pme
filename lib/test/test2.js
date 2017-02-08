'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express2.default)(); /**
                                       * @module test
                                       * @desc
                                       * @author Created by kimhou on 2016/11/28
                                       */


app.use((req, res, next) => {
  res.end('hello test2');
});

app.use((err, req, res, next) => {
  res.end('error');
});

app.listen(3102);