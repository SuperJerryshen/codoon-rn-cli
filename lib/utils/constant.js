/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:18:33 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-09-30 16:32:12
 */
const ROOT_PATH = process.cwd();
module.exports = {
  // 运行命令的项目根目录地址
  ROOT_PATH,
  // 上传rn代码秘钥地址
  CONFIG_PATH: ROOT_PATH + '/config.js',
  // 入口文件地址
  PAGE_ENTRY_PATH: ROOT_PATH + '/pageEntry.js',
  RN_CONFIG_PATH: ROOT_PATH + '/rn.config.js',
};
