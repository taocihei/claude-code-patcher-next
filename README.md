# Claude Code Patcher Next

Version-aware patch manager for Claude Code.

This project is intentionally conservative:

- Claude Code 2.0.x legacy `cli.js` builds can be patched with string patches.
- Claude Code 2.1.x native binary builds are detected and reported, but not binary-patched.
- Backups are created before modifying legacy `cli.js`.
- `--dry-run` and `--restore` are supported.

## Why 2.1.x Is Different

Claude Code 2.1.x changed the npm package layout. On Windows, the package entry is:

```text
bin/claude.exe
```

Older patch projects modify:

```text
cli.js
```

Those approaches are not equivalent. This tool refuses to patch native binaries.

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

## Local Test

```powershell
npm test
```

## Current Behavior On Claude Code 2.1.119

`doctor` should report:

```text
Layout: native
Version: 2.1.119
Binary: ...\bin\claude.exe
Status: supported for detection/config only. Native binary patching is intentionally disabled.
```

That is expected.

## License

MIT
