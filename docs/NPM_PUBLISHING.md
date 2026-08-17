# Catnap Studio npm 一行安装与发布

目标安装体验：

```powershell
dsh plugin --profile web add dsh-client-ui-skin-catnap@latest
dsh web
```

DSH 会通过 pnpm 自动下载 npm 包；用户不再需要手动下载 `.tgz`。猫咪图片、动作帧、纹理和本地音频都仍包含在包内。

## 当前状态

仓库已具备 npm 发布配置，但 **npm 首次发布尚未执行**。因此在 npm 出现首个公开版本之前，README 中的 GitHub Release `.tgz` 安装方式仍是当前可用方式。

不要在未确认包名、版本和发布内容时推送 tag：`.github/workflows/release.yml` 会在 `v*` tag 上同时执行 npm 发布和 GitHub Release。

## 一次性的 npm 账户设置

包名为 `dsh-client-ui-skin-catnap`，仓库为 `luoyan96/dsh-catnap-studio`，发布工作流文件名为 `release.yml`。

1. 在 [npmjs.com](https://www.npmjs.com/) 登录或创建维护者账户，并启用双因素认证。
2. 确认 `dsh-client-ui-skin-catnap` 可以由该账户公开发布。若名称已被他人占用，**先停止发布**，决定新包名后再同步修改 `package.json`、README、Desktop 同步配置和文档。
3. 首次包必须先发布到 npm，随后 npm 才允许配置 Trusted Publisher。选择一个尚未发布的正式版本，例如 `0.3.2`；更新版本、变更记录和 Release Notes，完成测试后，在本机运行：

   ```powershell
   npm login
   npm publish --access public
   ```

   这一步会公开发布 npm 包，必须由拥有 npm 账户的维护者在确认后执行。
4. 打开 npm 包的 **Settings → Trusted publishing**，选择 **GitHub Actions**，填写：

   | 字段 | 值 |
   | --- | --- |
   | Organization or user | `luoyan96` |
   | Repository | `dsh-catnap-studio` |
   | Workflow filename | `release.yml` |
   | Allowed action | `npm publish` |

5. 在 npm 页面确认保存。无需把 npm token 写入 GitHub Secrets；工作流使用 GitHub OIDC 短期身份令牌。

官方说明：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)。OIDC 发布要求 GitHub-hosted runner、`id-token: write` 权限、Node `>=22.14` 和 npm CLI `>=11.5.1`；工作流已满足这些条件并在发布前升级 npm CLI。

## 后续正式发布

1. 更新 `package.json`、`CHANGELOG.md`、`RELEASE_NOTES_v<version>.md`。
2. 执行：

   ```powershell
   pnpm install --frozen-lockfile
   pnpm run ci
   ```

3. 提交并推送 `main`。
4. 由维护者确认版本和发布内容后，推送匹配 tag：

   ```powershell
   git tag v0.3.2
   git push origin v0.3.2
   ```

5. GitHub Actions 会依次：校验 tag/版本、构建、打包、生成 SHA-256、`npm publish --access public`、创建 GitHub Release。
6. 在新终端验证最终用户体验：

   ```powershell
   dsh plugin --profile web add dsh-client-ui-skin-catnap@0.3.2
   dsh web
   ```

首次使用 `@latest` 前，也应确认 npm 的 `latest` dist-tag 指向刚发布的稳定版本。

## 安全与回滚

- npm 版本不可覆盖；发布前务必核对 tarball 内容、许可证、第三方声明和版本号。
- 不要把 `NPM_TOKEN`、`.npmrc` 凭据或 npm 登录文件提交到仓库。
- OIDC Trusted Publishing 取代长期发布 token；不要为了方便退回到明文 Secret。
- 已发布版本发现问题时，优先发布修复版本并更新 `latest`；不要删除用户可能已安装的版本。
- GitHub Release `.tgz` 继续保留，用于离线安装、校验与 npm 故障时的备用渠道。
