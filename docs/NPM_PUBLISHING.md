# Catnap Studio npm 发布与一行安装

目标安装体验：

```powershell
dsh plugin --profile web add dsh-catnap-plugins@latest
dsh web
```

DSH 会通过 pnpm 下载 npm 包；猫咪图片、动作帧、纹理和本地音频仍包含在包内，无需用户另行下载素材。

## 当前发布状态

- npm 包名：`dsh-catnap-plugins`
- 首发版本：`0.3.2`
- GitHub 源码仓库：`luoyan96/dsh-catnap-studio`（不因 npm 包改名而改变）
- npm registry：`dsh-catnap-plugins@0.3.2` 已公开发布，`latest` 指向 `0.3.2`。

不要推送 `v*` tag 作为试验：`.github/workflows/release.yml` 会同时执行 npm 发布和 GitHub Release。

## 首次公开发布（维护者手动执行）

这一步会创建不可覆盖的公开 npm 版本，必须由拥有 npm 账户的维护者在确认发布内容后执行：

```powershell
cd D:\deepseek-agent\dsh-catnap-plugins
$env:PNPM_CONFIG_STORE_DIR = "$env:LOCALAPPDATA\pnpm-store-dsh"
npm login
npm whoami
pnpm install --frozen-lockfile
pnpm run ci
npm publish --access public
npm view dsh-catnap-plugins version dist-tags --json
```

发布前核对：

- `package.json` 的 `name` 为 `dsh-catnap-plugins`，版本为 `0.3.2`；
- `pnpm run ci` 通过；
- `pnpm pack --dry-run` 中仅包含应发布的文件；
- npm 账户已启用双因素认证，且没有把 `.npmrc`、token 或登录文件提交到 Git；
- 若 `npm publish` 返回名称已占用、权限不足或版本已存在，立即停止，不要改用强制参数。

首次发布成功后，最终用户可验证：

```powershell
dsh plugin --profile web add dsh-catnap-plugins@0.3.2
dsh web
```

## 配置 GitHub OIDC Trusted Publisher

首次包已存在后，在 npm 包页面打开 **Settings → Trusted publishing**，选择 **GitHub Actions**，填写：

| 字段 | 值 |
| --- | --- |
| Organization or user | `luoyan96` |
| Repository | `dsh-catnap-studio` |
| Workflow filename | `release.yml` |
| Allowed action | `npm publish` |

保存后，不需要把长期 `NPM_TOKEN` 写入 GitHub Secrets。现有工作流已声明 `id-token: write`，并把 npm CLI 升级到兼容 Trusted Publishing 的版本。官方要求和限制见 [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)。

## 后续正式发布

1. 更新 `package.json`、`CHANGELOG.md` 和 `RELEASE_NOTES_v<version>.md`。
2. 执行：

   ```powershell
   pnpm install --frozen-lockfile
   pnpm run ci
   ```

3. 提交并推送 `main`。
4. 获得发布授权后，创建与 `package.json` 完全匹配的 tag，例如：

   ```powershell
   git tag v0.3.3
   git push origin v0.3.3
   ```

5. GitHub Actions 将校验版本、构建、打包、生成 SHA-256、使用 OIDC 执行 `npm publish --access public`，并创建 GitHub Release。

## 旧包名迁移

如果本机 profile 里曾安装旧本地包，先移除旧名，再安装新名：

```powershell
dsh plugin --profile web remove dsh-client-ui-skin-catnap
dsh plugin --profile web add dsh-catnap-plugins@latest
dsh web
```

`ui-skin-catnap` 的 Cordis wiring id、`data-dsh-catnap` 属性和浏览器本地偏好 key 保持不变，因此重装不会丢失主题、猫咪位置或声音设置。

## 安全与回滚

- npm 已发布版本不可覆盖；修复问题时发布新版本，不删除用户可能安装的版本。
- GitHub Release `.tgz` 保留为离线安装、校验和 npm 故障时的备用渠道。
- 不要复用旧 tag，也不要在未授权时 push tag、发布 npm 包或创建 Release。
