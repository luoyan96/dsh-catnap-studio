# 猫咪主题工坊 · Catnap Studio

中文 | [English](README.en.md)

面向 DeepSeek Harness Web UI 的三合一猫咪皮肤插件。一个安装包内置三套完整外观，用户可从底部状态栏即时切换，选择会保存在浏览器本地。

| 暖纸猫窝 | 月夜守护 | 猫咪工坊 |
| --- | --- | --- |
| ![暖纸猫窝](preview/warm.png) | ![月夜守护](preview/moonlit.png) | ![猫咪工坊](preview/atelier.png) |

## 三套主题

- **暖纸猫窝**：奶油纸张、杏橙控件和趴在输入框旁的橘猫。
- **月夜守护**：深靛夜色、金色星点、守夜黑猫和提灯睡猫。
- **猫咪工坊**：再生纸、蓝红标记、协作便笺和探头的奶牛猫。

所有猫咪插画与纸张纹理均打包进浏览器 bundle，插件运行时不会请求外部图片。它只修改呈现层，不注入业务服务、不发送 Cordis 事件，也不触及模型请求。

## 环境要求

- Node.js `^22.19.0` 或 `>=24`
- pnpm `11.21.0`
- DeepSeek Harness Web UI

## 从源码安装

```sh
git clone https://github.com/luoyan96/dsh-catnap-studio.git
cd dsh-catnap-studio
pnpm install
pnpm run ci
dsh plugin --profile web add link:$(pwd)
dsh web
```

Windows PowerShell 可将最后两步改为：

```powershell
dsh plugin --profile web add link:$PWD
dsh web
```

安装或升级后需要重启 `dsh web`。卸载：

```sh
dsh plugin --profile web remove dsh-client-ui-skin-catnap
```

## 使用 Release 安装包

推送形如 `v0.2.0` 的 Git 标签后，仓库的 Release 工作流会自动运行验证并上传 `dsh-client-ui-skin-catnap-0.2.0.tgz`。下载后可将本地包路径传给 `dsh plugin --profile web add`。

## 开发

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
pnpm run pack:check
```

打开本地预览：

```sh
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/preview/index.html?theme=warm`。查询参数 `theme` 支持 `warm`、`moonlit`、`atelier`；猫咪工坊的活跃会话示例可追加 `&state=active`。

## 仓库结构

```text
.github/workflows/   持续集成与标签发布
design/              参考稿、可复现素材母版和运行时图片
design-qa/           同尺寸视觉对照证据
preview/             可直接打开的主题预览与仓库截图
scripts/             素材压缩、嵌入和视觉对照脚本
src/                 DSH 插件源码
tests/               生命周期与主题切换测试
```

主题和组件约束见 [DESIGN.md](DESIGN.md)，视觉验收记录见 [design-qa.md](design-qa.md)，参与开发见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[BSD-3-Clause](LICENSE)
