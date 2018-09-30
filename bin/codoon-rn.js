#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');

const log = console.log;

program.version('0.0.1');

// 开始运行项目
program.command('start').action(require('../lib/start'));

// 选择现在运行的项目
program.command('select').action(require('../lib/select'));

// 打包选中的项目
program.command('build').action(require('../lib/build'));

// 上传已经打包的文件
program.command('upload').action(require('../lib/upload'));

program.parse(process.argv);
