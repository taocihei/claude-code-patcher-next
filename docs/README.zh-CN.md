# Claude Code Patcher Next

[English](README.en.md) | [简体中文](README.zh-CN.md)

Claude Code Patcher Next 是一个带版本识别能力的 Claude Code 补丁管理工具。它会检测
Claude Code 当前是旧版 JavaScript `cli.js` 结构，还是新版 native binary 结构，然后根据
结构选择安全的行为。

## 功能

- 检测本地和全局 npm 位置中的 Claude Code 安装。
- 显示包版本、安装路径和可执行文件路径。
- 对 Claude Code 2.0.x 的旧版 `cli.js` 构建执行可恢复的字符串补丁。
- 对 Claude Code 2.1.x 的 native binary 构建明确拒绝打补丁。
- 修改旧版 `cli.js` 前自动创建备份。
- 支持 `--dry-run` 和 `--restore`。
- 管理 `~/.claude/subagent-models.json` 子代理模型配置。

## 为什么 Claude Code 2.1.x 不一样

Claude Code 2.1.x 改变了 npm 包结构。在 Windows 上，入口变成：

```text
bin/claude.exe
```

旧补丁项目主要修改的是：

```text
cli.js
```

这两者不是一回事。对 JavaScript bundle 做字符串替换是一类操作；直接修改 native 可执行文件是另一类操作，风险和边界完全不同。因此本项目会检测新版 native binary，并拒绝对其打补丁。

## 命令

```powershell
node src/cli.js doctor
node src/cli.js patch thinking --dry-run
node src/cli.js patch thinking
node src/cli.js patch thinking --restore

node src/cli.js config show
node src/cli.js config set --plan sonnet --explore haiku --general sonnet
node src/cli.js patch subagents --dry-run
node src/cli.js patch subagents
node src/cli.js patch subagents --restore
```

## Claude Code 2.1.119 上的预期结果

```text
Claude Code detection:
  Layout: native
  Package: ...\node_modules\@anthropic-ai\claude-code
  Version: 2.1.119
  Binary: ...\bin\claude.exe

Status: supported for detection/config only. Native binary patching is intentionally disabled.
```

这是预期行为，不是错误。

## 致谢与引用

本项目的思路参考并引用了原作者项目：

[aleks-apostle/claude-code-patches](https://github.com/aleks-apostle/claude-code-patches)

本仓库是重新实现的独立版本，主要区别包括：

- 增加版本和包结构识别；
- 对 native binary 明确拒绝补丁；
- 拆分检测、配置、补丁模块；
- 调整命令结构和说明文档。

## 许可证

MIT
