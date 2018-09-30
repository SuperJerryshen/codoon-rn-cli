/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:18:05 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-09-30 16:33:01
 */
const spawn = require('child_process').spawn;

module.exports = async () => {
  // 选择页面，并修改根目录下的pageEntry.js
  await require('./utils/selectPage')();

  // 执行 npm run start
  spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
  });
};
