/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:17:54 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-10-10 17:07:47
 * @Content: 让用户根据 rn.config.js 中的配置选择需要渲染的页面
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { RN_CONFIG_PATH } = require('./constant');

module.exports = async () => {
  /**
   * 查询 rn.config.js 是否存在
   */
  const isRnConfigExist = await fse.pathExists(RN_CONFIG_PATH);
  if (isRnConfigExist) {
    const rnConfig = require(RN_CONFIG_PATH);

    /**
     * 生成项目选择
     */
    const choices = _.map(rnConfig, (config, idx) => {
      const { name } = config;
      return {
        name,
        value: idx,
      };
    });

    /**
     * 让用户选择需要运行的项目
     */
    const select = await inquirer.prompt({
      type: 'list',
      name: 'rnPage',
      message: '请选择你想要启动的项目',
      choices,
    });
    const selectConfig = rnConfig[select.rnPage];

    /**
     * 生成 pageEntry.js
     */
    await require('./genPageEntry')(selectConfig);

    // 返回选中的配置
    return selectConfig;
  } else {
    // 如果 rn.config.js 文件不存在，则报错并退出
    console.log(
      '文件: ' + chalk.red('rn.config.js') + ' 不存在，请检查，或者查阅文档！'
    );
    process.exit();
  }
};
