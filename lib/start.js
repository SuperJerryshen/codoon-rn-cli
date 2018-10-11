/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:18:05 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-10-11 11:42:04
 */
const spawn = require('child_process').spawn;
const { ROOT_PATH } = require('./utils/constant');

module.exports = async () => {
  // 选择页面，并修改根目录下的pageEntry.js
  await require('./utils/selectPage')();

  // 执行 start
  spawn(
    'node',
    [`${ROOT_PATH}/node_modules/react-native/local-cli/cli.js`, 'start'],
    {
      stdio: 'inherit',
    }
  );
};
