const spawn = require('child_process').spawn;
const { ROOT_PATH } = require('./utils/constant');
const fs = require('fs-extra');
const ora = require('ora');
const inquirer = require('inquirer');

module.exports = async () => {
  const selection = await require('./utils/selectPage')();
  const outputPath = {
    ios: `./build/ios/${selection.pageName}/${selection.version}`,
    android: `./build/android/${selection.pageName}/${selection.version}`,
  };

  // 确认有无目录
  fs.ensureDirSync(outputPath.ios);
  fs.ensureDirSync(outputPath.android);

  // 打包完成的数量，用于结束打包过程
  let successNum = 0;

  // 显示"打包中"的状态
  const spinner = ora('正在打包...').start();

  // 打包完成后的回调
  const successExit = () => {
    successNum += 1;
    if (successNum === 2) {
      spinner.stop();
      inquirer
        .prompt({
          type: 'confirm',
          name: 'sure',
          message: '打包成功，是否进行上传',
        })
        .then(answer => {
          if (answer.sure) {
            require('./utils/uploadRemote')(selection);
          } else {
            process.exit();
          }
        });
    }
  };

  // 打包ios
  const buildIOS = spawn('node', [
    `${ROOT_PATH}/node_modules/react-native/local-cli/cli.js`,
    'bundle',
    '--entry-file',
    './index.ios.js',
    '--bundle-output',
    `${outputPath.ios}/main.jsbundle`,
    '--platform',
    'ios',
    '--dev',
    'false',
  ]);

  // 打包android
  const buildAndroid = spawn('node', [
    `${ROOT_PATH}/node_modules/react-native/local-cli/cli.js`,
    'bundle',
    '--entry-file',
    './index.android.js',
    '--bundle-output',
    `${outputPath.android}/main.jsbundle`,
    '--platform',
    'android',
    '--dev',
    'false',
  ]);

  // 绑定完成后的事件
  buildIOS.on('close', successExit);
  buildAndroid.on('close', successExit);
};
