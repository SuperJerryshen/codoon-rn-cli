#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');

const log = console.log;

program.version('0.0.1');

// 开始运行项目
program.command('start').action(() => {
  require('../lib/start')();
});

program.parse(process.argv);
