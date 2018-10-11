/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 18:16:42 
 * @Last Modified by: 沈经纬(shenjw@codoon.com)
 * @Last Modified time: 2018-10-11 10:42:32
 * @Content: 在老版的oss-rn-upload基础上做了部分修改
 */
const OSS = require('ali-oss');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const co = require('co');
const crypto = require('crypto');

const {
  ROOT_PATH,
  CONFIG_PATH,
  PAGE_ENTRY_PATH,
  RN_CONFIG_PATH,
} = require('./constant');
const CDNROOT = 'https://tms.codoon.com/';

// 获取上传秘钥
const uploadConfig = require('./getUploadConfig')();
const oss = new OSS({
  bucket: uploadConfig.bucket,
  region: 'oss-cn-hangzhou',
  timeout: 300 * 1000,
  accessKeyId: uploadConfig.accessKeyId,
  accessKeySecret: uploadConfig.accessKeySecret,
});

const getConf = () => {
  const pageEntry = fs.readFileSync(PAGE_ENTRY_PATH);
  const pageConfigs = fs.readJsonSync(RN_CONFIG_PATH);
  let usedConfig = null;
  let minCodoonVersion = '8.5';
  let ret = null;
  _.forEach(pageConfigs, config => {
    if (pageEntry.indexOf(config.pageName) > -1) {
      usedConfig = config;
    }
  });
  minCodoonVersion = fs.readJsonSync(ROOT_PATH + '/package.json')
    .minCodoonVersion;

  if (usedConfig) {
    ret = {
      pageName: usedConfig.pageName,
      version: usedConfig.version,
      minCodoonVersion,
    };
  }

  return ret;
};

const generateSignature = filePath => {
  const md5 = crypto.createHash('md5');
  const file = fs.readFileSync(filePath, 'utf-8');

  md5.update(file);
  md5.update(uploadConfig.keygen);

  return md5.digest('hex');
};

const checkRemoteExists = (ossPath, existCB, emptyCB) => {
  co(function*() {
    try {
      const head = yield oss.head('rna/' + ossPath);

      if (head) {
        existCB();
      }
    } catch (e) {
      if (e.status == 404) {
        emptyCB();
      } else {
        throw e;
      }
    }
  });
};

const upload = (filePath, config, ENV) => {
  const BUNDLE_BUILD_PATH = `${ROOT_PATH}/build/{os}/${config.pageName}/${
    config.version
  }/main.jsbundle`;
  console.log(
    chalk.yellow(
      '=========================================== uploading ==========================================='
    )
  );
  console.log();
  co(function*() {
    try {
      const iosBundlePath = BUNDLE_BUILD_PATH.replace('{os}', 'ios');
      const retIos = yield oss.put('rni/' + filePath, iosBundlePath, {
        meta: {
          signature: generateSignature(iosBundlePath),
        },
        headers: {
          'Content-Type': 'application/javascript',
        },
      });

      const androidBundlePath = BUNDLE_BUILD_PATH.replace('{os}', 'android');
      const retAndroid = yield oss.put('rna/' + filePath, androidBundlePath, {
        meta: {
          signature: generateSignature(androidBundlePath),
        },
        headers: {
          'Content-Type': 'application/javascript',
        },
      });
      console.log(chalk.yellow('Bundle Version: %s'), config.version);
      console.log(
        chalk.yellow('Bundle IOS Address: %s'),
        CDNROOT + retIos.name
      );
      console.log(
        chalk.yellow('Bundle Android Address: %s'),
        CDNROOT + retAndroid.name
      );
      console.log(
        chalk.yellow('Upload bundle successfully to environment: %s'),
        ENV
      );
      console.log();
      console.log(
        chalk.yellow(
          '================================================================================================='
        )
      );
    } catch (e) {
      console.error(e);
      return;
    }
  });
};

const overiteCheck = (config, ENV) => {
  const ossPath = `${ENV}/${config.pageName}/${config.minCodoonVersion ||
    '8.5'}/${config.version}/main.jsbundle`;

  checkRemoteExists(
    ossPath,
    () => {
      inquirer
        .prompt({
          type: 'confirm',
          name: 'sure',
          message: '已经发布过::' + ossPath + ' 是否确认覆盖发布？',
        })
        .then(answer => {
          if (answer.sure) {
            upload(ossPath, config, ENV);
          } else {
            console.log('上传已取消');
          }
        });
    },
    () => {
      upload(ossPath, config, ENV);
    }
  );
};

module.exports = async config => {
  // 选择上传的环境
  const selections = await inquirer.prompt([
    {
      type: 'list',
      name: 'env',
      message: '请选择你需要上传的环境',
      choices: [
        {
          name: '测试环境',
          value: 'test',
        },
        {
          name: '灰测环境',
          value: 'ab',
        },
        {
          name: '线上环境',
          value: 'online',
        },
      ],
    },
  ]);
  const ENV = selections.env;
  config || (config = getConf());
  if (config) {
    overiteCheck(config, ENV);
  } else {
    console.log();
    console.log('无法获取配置信息');
    process.exit();
  }
};
