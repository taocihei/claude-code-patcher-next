# Claude Code Patcher Next

<p align="center">
  <a href="LICENSE"><img alt="许可证" src="https://img.shields.io/github/license/taocihei/claude-code-patcher-next?style=for-the-badge"></a>
  <a href="https://github.com/taocihei/claude-code-patcher-next/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/taocihei/claude-code-patcher-next?style=for-the-badge"></a>
  <a href="docs/README.zh-CN.md"><img alt="中文文档" src="https://img.shields.io/badge/docs-%E4%B8%AD%E6%96%87-blue?style=for-the-badge"></a>
  <a href="docs/README.en.md"><img alt="English Docs" src="https://img.shields.io/badge/docs-English-green?style=for-the-badge"></a>
  <img alt="Claude Code" src="https://img.shields.io/badge/Claude%20Code-2.0.x%20%7C%202.1.x-purple?style=for-the-badge">
</p>

Version-aware patch manager for Claude Code.

## Languages

- [English](docs/README.en.md)
- [简体中文](docs/README.zh-CN.md)

## Quick Summary

Claude Code Patcher Next detects your Claude Code installation and safely handles
legacy JavaScript patch workflows.

- Claude Code 2.0.x legacy `cli.js` builds can be patched.
- Claude Code 2.1.x native binary builds are detected but not binary-patched.
- `--dry-run`, backup, restore, and subagent model config helpers are included.

## Attribution

This project was inspired by and references the patching approach from
[aleks-apostle/claude-code-patches](https://github.com/aleks-apostle/claude-code-patches).
The implementation here is rewritten with version-aware detection and explicit
native-binary safety checks.

## License

MIT
