# codoon-rn-cli

> 辅助咕咚 RN 开发、打包与上传的命令行工具。

## 安装

```bash
# 局部安装

npm install --save codoon-rn-cli

yarn add codoon-rn-cli

# 全局安装

npm install -g codoon-rn-cli

yarn global add codoon-rn-cli
```

## 使用

### 通过命令行开始

```bash
# 本地开始项目
codoon-rn start

# 更换本地运行的pageEntry
codoon-rn select

# 打包
codoon-rn build

# 上传现在pageEntry中的页面
codoon-rn upload
```

### 通过 npm scripts 开始

需在本地安装`codoon-rn-cli`后，在`package.json`中添加以下`scripts`代码。

```json
{
  "scripts": {
    "start": "codoon-rn start",
    "build": "codoon-rn build",
    "change-page": "codoon-rn select",
    "upload": "codoon-rn upload"
  }
}
```

## 配置

> 注意：配置文件都是位于根目录下的。

### page.config.json（不可缺少）

> 该文件为 JSON 格式，格式如下所示。

```json
[
  {
    "name": "页面的中文名称",
    "pageName": "page_upload_name",
    "path": "path/to/entry_file",
    "version": "0.0.1",
    "minCodoonVersion": "8.5" // 可选项，默认值为8.5
  }
]
```

### config.js（upload 时必需）

> 该文件为上传的秘钥，格式如下。

```javascript
module.exports = {
  keygen: '',
  bucket: '',
  accessKeyId: '',
  accessKeySecret: '',
};
```
