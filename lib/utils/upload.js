/*
 * @Author: 沈经纬(shenjw@codoon.com) 
 * @Date: 2018-09-30 16:42:52 
 * @Last Modified by:   沈经纬(shenjw@codoon.com) 
 * @Last Modified time: 2018-09-30 16:42:52 
 */
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');
const OSS = require('ali-oss');
const co = require('co');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { ROOT_PATH, CONFIG_PATH, PAGE_ENTRY_PATH } = require('./constant');
const log = (msg = '', color = 'white') => {
  console.log(chalk[color](msg));
};

module.exports = async () => {
  // 获取上传秘钥
  const uploadConfig = require('./getUploadConfig')();

  const oss = new OSS({
    bucket: uploadConfig.bucket,
    region: 'oss-cn-hangzhou',
    timeout: 300 * 1000,
    accessKeyId: uploadConfig.accessKeyId,
    accessKeySecret: uploadConfig.accessKeySecret,
  });

  const CDNROOT = 'https://tms.codoon.com/';
  const BUNDLE_BUILD_PATH = ROOT_PATH + '/build/{os}/main.jsbundle';

  const envSelect = await inquirer.prompt([
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

  const ENV = envSelect.env;

  const getConf = () => {
    const regex = /\/([^\s\/\.]+)\/([0-9\.]+)\s*$/;
    const PKG = ROOT_PATH + '/package.json';
    const GITHEAD = ROOT_PATH + '/.git/HEAD';

    let gitHead = '',
      minCodoonVersion = '8.5.0';
    if (fs.existsSync(GITHEAD) && fs.existsSync(PKG)) {
      gitHead = fs.readFileSync(GITHEAD, 'utf-8');
      minCodoonVersion = JSON.parse(fs.readFileSync(PKG, 'utf-8'))
        .minCodoonVersion;
    } else {
      log('There has not any .git config information.');
      return false;
    }

    const ret = {};
    const reg = gitHead.match(regex);
    if (reg && reg.length >= 2) {
      ret.projectName = reg[1];
      ret.jsCodeVersion = reg[2];
      ret.minCodoonVersion = minCodoonVersion;

      /*
		*	Check ProjectName
		* */
      if (false) {
      }
    } else {
      log('Git branch name format error.');
      return false;
    }

    if (fs.existsSync(PAGE_ENTRY_PATH)) {
      pageEntry = fs.readFileSync(PAGE_ENTRY_PATH, 'utf-8');

      if (pageEntry.match(/NODE_ENV/)) {
        const pageName = pageEntry.replace(/\/\/.*/g, '').match(/\w*_\w*/g);
        if (pageName[pageName.length - 1] !== ret.projectName) {
          log(
            '===================================================================================',
            'red'
          );
          log();
          console.log(
            chalk.red(
              'PageName in pageEntry.js is not equal current git branch name "%s"'
            ),
            ret.projectName
          );
          log();
          log(
            '===================================================================================',
            'red'
          );
          return false;
        }
      } else {
        const pageName = pageEntry.replace(/\/\/.*/g, '').match(/\w*_\w*/g);
        if (pageName !== ret.projectName) {
          log(
            '===================================================================================',
            'red'
          );
          log();
          console.log(
            chalk.red(
              'PageName in pageEntry.js is not equal current git branch name "%s"'
            ),
            ret.projectName
          );
          log();
          log(
            '===================================================================================',
            'red'
          );
          return false;
        }
      }
    }

    return ret;
  };

  const generateSignature = filePath => {
    const md5 = crypto.createHash('md5');
    const file = fs.readFileSync(filePath, 'utf-8');

    md5.update(file);
    md5.update(CONFIG_PATH.keygen);

    return md5.digest('hex');
  };

  const checkRemoteExists = (ossPath, existCB, emptyCB) => {
    let exists = false;

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

  const overiteCheck = config => {
    const ossPath =
      ENV +
      '/{projectName}/{minCodoonVersion}/{jsCodeVersion}/main.jsbundle'.replace(
        /\{(\w+)\}/g,
        (part, key) => {
          return config[key];
        }
      );

    if (ENV == 'online' || ENV == 'ab') {
      checkRemoteExists(
        ossPath,
        () => {
          /**
           * TODO::覆盖操作不稳妥，看看是不是去掉
           */
          const ruSure =
            '已经发布过::' + ossPath + ' 是否确认覆盖发布？(输入Y/N)';

          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          rl.question(ruSure, answer => {
            rl.close();

            if (answer.trim().toUpperCase() == 'Y') {
              upload(ossPath, config);
            } else {
              log('Upload has been canceled.', true);
            }
          });
        },
        () => {
          upload(ossPath, config);
        }
      );
    } else {
      upload(ossPath, config);
    }
  };

  const upload = (filePath, config) => {
    log(
      '=========================================== uploading ===========================================',
      'yellow'
    );
    log();
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
        console.log(chalk.yellow('Bundle Version: %s'), config.jsCodeVersion);
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
        log();
        log(
          '=================================================================================================',
          'yellow'
        );
      } catch (e) {
        console.error(e);
        return;
      }
    });
  };

  const config = getConf();
  if (config) {
    overiteCheck(config);
  }
};
