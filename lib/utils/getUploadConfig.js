/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:18:39 
 * @Last Modified by:   沈经纬(shenjw@codoon.com) 
 * @Last Modified time: 2018-09-30 16:18:39 
 */
const fs = require('fs-extra');
const chalk = require('chalk');
const { CONFIG_PATH } = require('./constant');

module.exports = () => {
  const isExited = fs.existsSync(CONFIG_PATH);
  if (isExited) {
    return require(CONFIG_PATH);
  } else {
    console.log(
      chalk.red('根目录下的"config.js"文件不存在，该文件为上传rn代码的秘钥。')
    );
    process.exit();
  }
};
