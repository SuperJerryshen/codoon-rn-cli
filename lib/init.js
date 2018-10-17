const inquirer = require('inquirer');
const { RN_CONFIG_PATH } = require('./utils/constant');
const fs = require('fs-extra');

const questions = [
  {
    type: 'input',
    name: 'name',
    message: '请输入页面中文名',
    default: () => '页面中文名',
  },
  {
    type: 'input',
    name: 'pageName',
    message: '请输入页面英文名',
    default: () => '页面英文名',
  },
  {
    type: 'input',
    name: 'path',
    message: '请输入页面路径',
    default: () => 'src/p/to_your_page',
  },
  {
    type: 'input',
    name: 'version',
    message: '请输入版本号',
    default: () => '0.0.1',
  },
];

module.exports = async () => {
  const isExist = await fs.pathExists(RN_CONFIG_PATH);
  if (isExist)
    return console.log('page.config.json 已经存在，不能再进行初始化');
  const answers = await inquirer.prompt(questions);
  await fs.outputJson(RN_CONFIG_PATH, [answers]);
  console.log('初始化完成，请自行格式化处理！');
};
