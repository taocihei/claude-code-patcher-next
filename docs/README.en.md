# Claude Code Patcher Next

[English](README.en.md) | [简体中文](README.zh-CN.md)

Claude Code Patcher Next is a version-aware patch manager for Claude Code. It
detects whether Claude Code is installed as a legacy JavaScript `cli.js` package
or as a modern native binary package, then chooses the safe behavior for that
layout.

## Features

- Detect Claude Code installations from local and global npm locations.
- Report package version, package path, and executable path.
- Patch legacy Claude Code 2.0.x `cli.js` builds with reversible string patches.
- Refuse to patch Claude Code 2.1.x native binaries.
- Create backups before modifying legacy `cli.js`.
- Support `--dry-run` and `--restore`.
- Manage `~/.claude/subagent-models.json`.

## Why Claude Code 2.1.x Is Different

Claude Code 2.1.x changed the npm package layout. On Windows, the package entry is:

```text
bin/claude.exe
```

Older patchers target:

```text
cli.js
```

Those are not equivalent. A string patch that is reasonable for a JavaScript
bundle should not be applied blindly to a native executable. This project detects
native binary builds and refuses to patch them.

## Commands

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

## Expected Output On Claude Code 2.1.119

```text
Claude Code detection:
  Layout: native
  Package: ...\node_modules\@anthropic-ai\claude-code
  Version: 2.1.119
  Binary: ...\bin\claude.exe

Status: supported for detection/config only. Native binary patching is intentionally disabled.
```

That is expected behavior.

## Attribution

This project was inspired by and references the patching approach from
[aleks-apostle/claude-code-patches](https://github.com/aleks-apostle/claude-code-patches).

The code in this repository is rewritten as a separate implementation with:

- version-aware package detection,
- native-binary refusal behavior,
- clearer command structure,
- separate config and patch modules.

## License

MIT
