# Claude Code Patcher Next

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
