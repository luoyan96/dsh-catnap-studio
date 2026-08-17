# Catnap Studio 前端知识库与重设计基线

> 更新：2026-08-17
> 仓库：`D:\deepseek-agent\dsh-catnap-plugins`
> GitHub：[luoyan96/dsh-catnap-studio](https://github.com/luoyan96/dsh-catnap-studio)  
> 当前基线：`6692629` / `v0.3.1`

本文是重新设计与开发 Catnap Studio 前的统一事实来源。它记录现有代码、素材、DSH 接入、验收、发布和仓库同步方式。除非本文明确标为“建议”，其余内容描述的是当前已实现的状态。

## 1. 产品范围

Catnap Studio 是安装到 **DeepSeek Harness（DSH）Web profile** 的前端插件，不是独立 Web 应用，也不是 Electron 桌面壳。

它承担：

- 三套可持久化的 DSH Web UI 猫咪主题；
- 设置中的主题选择、Catnap Studio 面板和猫窝入口；
- 工作区陪伴猫、抚摸、声音、自动活动、减少动态效果；
- DSH Web UI 的任务看板、Git 图谱、文件面板、实时统计和插件设置整合；
- 所有插件 DOM、样式、监听器和计时器的可撤销生命周期。

它不承担：

- Electron 生命周期、端口管理、独立 `DSH_HOME`、安装包和自动更新；这些属于 Catnap Desktop；
- 论文、科研市场、社区、账户、支付或科研点；这些不属于第一阶段；
- 模型调用、密钥保存或后端业务。

产品是独立社区项目，基于 DeepSeek Harness 构建，不能暗示 DeepSeek 官方背书。

## 2. 当前版本与已完成内容

| 项目 | 状态 |
| --- | --- |
| npm / DSH 包名 | `dsh-catnap-plugins` |
| 包版本 | `0.3.3`（待发布；`0.3.2` 当前为已发布基线） |
| 当前提交 | 本地重命名发布准备中 |
| AI-02 前端修复 | `557587b`，已包含在 `v0.3.1` 和远端 `main` |
| 主题 | 暖纸猫窝、月夜守护、猫咪工坊 |
| 自动化测试 | 5 个测试文件，当前基线为 22 项测试 |
| 本地状态 | `dsh-catnap-theme` 与 `dsh-catnap-companion`，仅浏览器 `localStorage` |

已实现的陪伴状态是：`resting`、`sleeping`、`stretching`、`playing-yarn`、`petted`、`paused`。默认安静；首次大动作延后 30–60 秒，输入后等待 3 秒，伸懒腰和毛线球均按较长随机间隔触发。只有用户直接抚摸会尝试播放本地呼噜声。

## 3. DSH 接入结构

```text
DSH Web profile
  -> cordis.patch.yml 注册 ui-skin-catnap
  -> src/index.ts（Host entry）注册五项工作台模块
  -> lib/index.js
  -> DSH client inject
  -> src/client/index.ts（浏览器 entry）
      -> 主题 token / CSS
      -> 设置入口和 Catnap Studio 面板
      -> 陪伴状态机、调度、音频、本地偏好
      -> 主题与猫咪素材 data URI
```

`package.json` 中的 `dsh.client.inject` 是客户端所需服务注入声明。`cordis.patch.yml` 只插入一个 `ui-skin-catnap` 行；不要手工往 DSH 用户 profile 写入额外业务配置。

`src/index.ts` 是 Host 入口，组合了下列已归因的浏览器/Host 模块：

- `@linxin666/dsh-client-ui-web-ui-settings`
- `@linxin666/dsh-client-ui-aionui-panel`
- `@linxin666/dsh-client-ui-task-board`
- `@linxin666/dsh-client-ui-git-graph`
- `@linxin666/dsh-live-stats`

`dsh-better-sidebar` 是可选的独立工作台底座，不是 Catnap 依赖。由于它的
`betterSidebar` 服务只存在于客户端，Catnap Host 保留旧 Aion/Git Host 模块来
支持未安装时的回退；客户端会先异步探测可选模块。探测成功时只激活设置、任务
看板和实时统计，跳过旧 Aion 文件面板和旧 Git 图谱客户端，且写入
`data-catnap-better-sidebar` 供主题样式让位。探测失败时完整激活旧模块。任何
探测结果在 Catnap 已 dispose 后都不得再写 DOM 或调用模块 `apply`。

Catnap 不打包或复制 Better Sidebar 的终端、文件系统、WebSocket、node-pty 或
MIT 源码；三主题通过已有 `--dsw-alias-*` 设计 token 着色。

这些模块在构建时打包为单一插件；`tsdown.config.ts` 对 `@linxin666/*`、`schemastery` 和 `zod` 使用 bundle，对 `@deepseek-ai/*` 保持外部依赖。这是 DSH profile 能用一条 `link:` 或一个 `.tgz` 安装的关键，不应随意改变。

## 4. 前端代码地图

| 文件 | 职责 | 重设计时的注意事项 |
| --- | --- | --- |
| `src/client/index.ts` | UI 装配、主题切换、设置嵌入、定位、事件、清理 | 目前较大；新设计可继续拆分视图层，但必须保留完整 disposer。 |
| `src/client/catnap.module.css` | 三套 token、宿主覆写、设置卡片、弹层与响应式规则 | 不要用无限增大的 `z-index` 解决遮挡；优先隐藏或让位。 |
| `src/client/companion/state-machine.ts` | 显式陪伴状态机 | 所有新增动作先加入类型、状态机和测试。 |
| `src/client/companion/scheduler.ts` | 随机时序、输入安静期、暂停与定时器清理 | 禁止把随机 `setTimeout` 直接散落到 DOM 事件里。 |
| `src/client/companion/audio.ts` | 本地音频播放与容错 | 保持声音只由直接抚摸触发、可关闭、失败无未处理异常。 |
| `src/client/companion/storage.ts` | 偏好读写和旧数据兼容 | 不存储密钥、会话内容或任何服务端数据。 |
| `src/client/companion/view.ts` | 状态到素材与文案的映射 | 新素材必须补全所有状态映射。 |
| `scripts/embed-cat.mjs` | 将运行时素材转成 `generated/theme-assets.ts` data URI | 生成文件已忽略；只改素材和脚本，不手改生成文件。 |
| `scripts/optimize-runtime-assets.py` | 从设计母版生成轻量运行时素材 | 依赖 Pillow；用于可复现压缩，不是浏览器运行时步骤。 |
| `tests/` | 生命周期、状态机、调度、存储和 UI 回归 | 改动交互、定位或遮挡时必须新增/更新测试。 |

## 5. 已实现的 UI 与交互契约

### 主题与入口

- 三主题是 `warm`、`moonlit`、`atelier`，主题 key 存入 `dsh-catnap-theme`。
- 正式主题入口是 **设置 → 通用设置 → 外观** 中的三张 Catnap 卡片。
- 底部状态栏保留 Catnap 状态和“猫窝”入口；旧的底栏主题选择器已被视觉隐藏，不能作为主要入口重新依赖。
- 猫窝入口打开 Catnap Studio 的“伙伴”标签；工作区猫点击/Enter/Space 仅触发抚摸。

### 陪伴与可访问性

- 可改名、隐藏/召回、声音开关、音量和“自主活动”开关均已实现并本地保存。
- `prefers-reduced-motion: reduce` 会停止自主动画；用户抚摸仍可提供无位移动画反馈。
- 指针移动未超过 5px 的 `pointerup` 才视为抚摸；拖动后保存位置。
- 当前默认未拖动的猫咪定位在输入区下方、会话区左侧的空白区，而非右侧文件栏或输入外壳上。

### 避让规则（不可回退）

当下列宿主状态存在时，装饰猫和可互动工作区猫都必须隐藏，调度进入 `paused`：

- DSH 设置对话框；
- 输入区附近展开的 popover；
- 任何外部 `[role="dialog"]`、`[role="menu"]`、`[role="listbox"]`；包括模型/模式选择菜单；
- 页面不可见、窗口失焦；
- 视口宽度不超过 860px。

实现依赖 `data-catnap-settings-open`、`data-catnap-composer-overlay-open` 和 `data-catnap-external-overlay-open`。这些属性和 CSS 规则是防回归边界；删除或绕开前必须完成真实 DSH 验收。

## 6. 素材资产与来源

素材分三层保存：

| 目录 | 内容 | 是否由浏览器直接加载 |
| --- | --- | --- |
| `design/assets/` | 纹理与部分角色的高质量母版、动作 sheet 源图 | 否，设计源文件。 |
| `design/runtime/` | 经过压缩的透明 PNG/WebP 与 `cat-purr.wav` | 是；由嵌入脚本读取。 |
| `src/client/generated/` | data URI TypeScript 生成结果 | 是；但已忽略，必须由脚本重建。 |

每套主题当前应具备下列运行时资产：

- 环境纹理：`*-paper-texture.webp`；
- 场景装饰：暖纸橘猫、月夜守护/提灯、工坊奶牛猫；
- 工作区陪伴：`resting`、`sleeping`、`stretching`、`playing-yarn`、`petted`、`bed`；
- 共享本地声音：`design/runtime/companion/cat-purr.wav`。

素材原则：保留原创猫、纸张纹理和插画；不得复制上游项目的人物、宠物、背景或 Logo。新增素材应保持同一主题内的花纹、比例、光向、画布基线和视觉重心一致，避免状态切换跳位。单独设计猫窝入口，不能复用工作区猫的探头/休息图。

`design/runtime/companion/atelier-v3-*` 目前是与同名 `atelier-*` 文件并存的历史副本；`embed-cat.mjs` 使用的是不含 `v3` 的文件。重设计时应先决定保留哪一套，再一次性更新脚本、映射和文档，避免隐性死资源。

## 7. 真实验收资产

以下为已提交的真实 DSH 页面证据，而非静态演示页：

- `docs/qa/2026-08-15-ai-02-settings.png`：设置内三主题入口；
- `docs/qa/2026-08-15-ai-02-menu-safe.png`：宿主菜单打开、工作区猫隐藏；
- `docs/qa/2026-08-15-ai-02-fixed-default.png`：默认猫咪避开输入区和右侧详情栏；
- `docs/qa/2026-08-15-ai-02-moonlit-petted.png`：月夜主题的真实抚摸状态。

更早的对照证据位于 `design-qa/`，包含三主题、任务看板、设置、响应式和六状态截图。`preview/` 只是开发预览，不能替代 DSH Host 验收。

## 8. 开发、测试和真实 Host 验收

### 本地开发

```powershell
cd D:\deepseek-agent\dsh-catnap-plugins
pnpm install --frozen-lockfile
node scripts\embed-cat.mjs
node_modules\.bin\tsc.cmd --noEmit
node_modules\.bin\vitest.cmd run
node_modules\.bin\tsdown.cmd
npm.cmd pack --dry-run --ignore-scripts --cache node_modules\.npm-cache
```

也可以使用 `pnpm run ci`，它执行类型检查、测试、构建和 package dry-run。受限环境中推荐显式指定仓库内 npm cache，避免写入用户级 cache 失败。

### 安装到 DSH Web profile（开发用）

```powershell
dsh plugin --profile web add "link:$($PWD.Path)"
dsh web
```

升级或重新构建后需重启 `dsh web`。如果出现重复的工作台模块，先移除旧的 `@linxin666/dsh-web-ui-all` 整合包。真实验收至少覆盖：三主题切换及刷新后的持久化、设置、菜单/模型列表、输入、右栏、弹层、抚摸、声音关闭、减少动画、800px 左右窄屏和控制台错误。

可选工作台底座安装：

```powershell
dsh plugin --profile web add dsh-better-sidebar@latest
```

安装后硬刷新浏览器。验证 Better Sidebar 的右栏/底栏、文件、终端、Git tab 时，
确认 Catnap 未出现旧 Aion/Git 双侧栏，且工作区猫不会压住其 editor、terminal、
菜单、输入框或设置弹层。

### 与 Desktop 的边界

Studio 提交且工作树干净后，由 Desktop 流程执行：

```powershell
cd D:\deepseek-agent\dsh-catnap-desktop
npm.cmd run sync:studio
npm.cmd run verify:embedding
```

绝不要手改 `dsh-catnap-desktop/vendor/catnap-plugin`。Desktop 的 EXE 构建和安装测试不在本仓库完成。

## 9. 已知文档漂移

重新设计前应以源码和测试为准，并修正文档：

- `README.md` 仍提及“喂小鱼干、好感度”等旧玩法；当前实现的核心设置是改名、隐藏、声音、音量和自主活动，未见现行养成 UI。
- `DESIGN.md` 的部分描述仍称主题选择器在状态栏、并描述过时的 affinity/treats；当前正式入口在设置外观区。
- `docs/CAT_COMPANION_REDESIGN_BRIEF.md` 是完成本轮陪伴重设计时的任务书，适合用作体验约束参考，但不是每条都代表当前代码。

更新设计或用户文案时，应把 README、DESIGN、`skin.json`、测试及本知识库一起校准。

## 10. 推荐的重新设计流程

1. **先定义边界与验收图**：确认三主题保留还是替换、工作区猫的固定锚点、猫窝入口身份与窄屏策略。
2. **先做三张独立方案图**：在真实 DSH 截图底图上展示，不修改代码；用户选定方案后才开始实现。
3. **先制作对齐素材**：每个主题的六状态共用画布尺寸和落脚基线，压缩至 `design/runtime/`，再运行嵌入脚本。
4. **将状态和定位解耦**：状态机、调度、视图映射和定位策略分别可测试；不要在 CSS/DOM 事件中散布业务状态。
5. **优先安全与安静**：默认静止；自主动作低频、无声音；弹层、菜单、输入、详情栏和窄屏优先于装饰可见性。
6. **每个交互改动都有真实 Host 截图**：静态预览只能辅助调色和版式。
7. **通过完整构建后再同步 Desktop**：保持 Studio 源提交、内嵌副本与安装包可追踪。

## 11. Git 与 GitHub：提交、上传和发布

### 普通代码同步（不发布）

普通 `push` 只更新远端分支，会触发 CI，**不会创建 Release**。建议每项逻辑完整、测试通过后执行：

```powershell
git status --short
git add src/client/index.ts src/client/catnap.module.css tests
git commit -m "fix: describe the Catnap change"
git push origin main
```

提交截图或文档时显式加入其目录，例如 `git add docs/qa docs/CATNAP_STUDIO_KNOWLEDGE_BASE.md`。不要 `git add -A` 混入 `.tgz`、`lib/`、`src/client/generated/`、日志、profile、缓存或用户数据。

推送前最小检查：

```powershell
git status --short
git log -1 --oneline
git ls-remote origin refs/heads/main
```

若 Git 因 Windows 文件所有权提示 `dubious ownership`，可对单条只读命令使用：

```powershell
git -c safe.directory=D:/deepseek-agent/dsh-catnap-plugins status --short
```

不要为了方便而不加审查地把目录加入全局安全例外。

### 正式 npm + GitHub Release（会产生外部状态）

只有版本号、Release Notes、截图、校验和和用户授权都确认后，才执行下列流程：

首次 npm 发布前，必须先阅读并完成 [NPM_PUBLISHING.md](NPM_PUBLISHING.md) 的包名认领和 Trusted Publishing 设置。配置完成后，普通用户可使用：

```powershell
dsh plugin --profile web add dsh-catnap-plugins@latest
dsh web
```

后续正式发布步骤：

1. 更新 `package.json` 版本、`CHANGELOG.md` 与匹配的 `RELEASE_NOTES_v<version>.md`。
2. 运行 `pnpm install --frozen-lockfile` 与 `pnpm run ci`。
3. 提交并先推送 `main`。
4. 创建与 `package.json` **完全相同**的 tag，例如：

   ```powershell
   git tag v0.3.2
   git push origin v0.3.2
   ```

5. `.github/workflows/release.yml` 会校验 tag/版本、重新构建、打包 `.tgz`、生成 `CHECKSUMS.txt`、通过 npm OIDC 发布公开包并创建 GitHub Release。GitHub Release `.tgz` 保留为离线安装备用渠道。

`v*` tag 会触发 Release 工作流，因此打 tag 不是普通同步动作。不要复用旧 tag；不要在未获授权时推送 tag 或创建 Release。

## 12. 发布前必过清单

- [ ] 三主题在真实 DSH 页面可切换并刷新后保持；
- [ ] 设置、模型菜单、输入框、发送按钮、文件/变更右栏、对话框和通知不被猫咪遮挡；
- [ ] 声音可关闭，自动活动可关闭，减少动态效果可用；
- [ ] 主题和陪伴偏好缺失/损坏时安全回退；
- [ ] TypeScript、Vitest、构建、pack dry-run 通过；
- [ ] 真实 DSH 截图已保存且与当前提交对应；
- [ ] 许可证、第三方声明和来源记录完整；
- [ ] Studio 提交后已由 Desktop 流程同步并验证嵌入；
- [ ] 只有用户明确允许时才 push tag/Release；npm 首发还需要 npm 维护者账户的外部确认。
