/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:18:30 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-09-30 17:16:18
 */
const fse = require('fs-extra');

const { ROOT_PATH } = require('./constant');

module.exports = async config => {
  const pageEntry = `
import pageEntry from './${config.path}'
import { Platform } from 'react-native';
let PageName
if (process.env.NODE_ENV === 'development') {
  PageName = Platform.OS === 'ios' ? 'community_hot' : 'rn_debug'
} else {
  PageName = '${config.pageName}'
}
export { PageName }
export default pageEntry
  `;
  /**
   * 根据选择的页面，生成pageEntry.js文件
   */
  await fse.outputFile(ROOT_PATH + '/pageEntry.js', pageEntry, 'utf-8');
};
