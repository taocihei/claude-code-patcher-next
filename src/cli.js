#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { detectClaudeCode } from './detect.js';
import { showConfig, writeSubagentConfig } from './config.js';
import {
  dryRunThinkingPatch,
  applyThinkingPatch,
  restoreThinkingPatch,
} from './patch-thinking.js';
import {
  dryRunSubagentPatch,
  applySubagentPatch,
  restoreSubagentPatch,
} from './patch-subagents.js';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`Claude Code Patcher Next

Usage:
  ccpatch-next doctor
  ccpatch-next patch thinking [--dry-run] [--restore]
  ccpatch-next patch subagents [--dry-run] [--restore]
  ccpatch-next config show
  ccpatch-next config set [--plan MODEL] [--explore MODEL] [--general MODEL]

Notes:
  - Legacy Claude Code 2.0.x cli.js builds can be patched.
  - Claude Code 2.1.x native binaries are detected but not binary-patched.
  - Valid model values: haiku, sonnet, opus.
`);
}

function hasFlag(flag) {
  return args.includes(flag);
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return undefined;
  return args[index + 1];
}

function requireDetected() {
  const detected = detectClaudeCode();
  if (!detected.found) {
    console.error('Claude Code was not found.');
    for (const attempt of detected.attempts) {
      console.error(`- ${attempt.method}: ${attempt.path}`);
    }
    process.exit(1);
  }
  return detected;
}

function printDetected(detected) {
  const info = detected.packageInfo;
  console.log('Claude Code detection:');
  console.log(`  Layout: ${detected.layout}`);
  console.log(`  Package: ${info.packageRoot}`);
  console.log(`  Version: ${info.version}`);
  if (detected.cliPath) console.log(`  cli.js: ${detected.cliPath}`);
  if (info.binPath) console.log(`  Binary: ${info.binPath}`);
  console.log(`  Method: ${detected.method}`);
}

async function main() {
  const command = args[0];

  if (!command || hasFlag('--help') || hasFlag('-h')) {
    printHelp();
    return;
  }

  if (command === 'doctor') {
    const detected = requireDetected();
    printDetected(detected);
    if (detected.layout === 'native') {
      console.log('');
      console.log('Status: supported for detection/config only. Native binary patching is intentionally disabled.');
    } else {
      console.log('');
      console.log('Status: legacy cli.js patching is available.');
    }
    return;
  }

  if (command === 'config') {
    const subcommand = args[1];
    if (subcommand === 'show') {
      showConfig();
      return;
    }

    if (subcommand === 'set') {
      writeSubagentConfig({
        Plan: valueAfter('--plan'),
        Explore: valueAfter('--explore'),
        'general-purpose': valueAfter('--general'),
      });
      showConfig();
      return;
    }
  }

  if (command === 'patch') {
    const target = args[1];
    const detected = requireDetected();
    const dryRun = hasFlag('--dry-run');
    const restore = hasFlag('--restore');

    if (target === 'thinking') {
      if (restore) restoreThinkingPatch(detected);
      else if (dryRun) dryRunThinkingPatch(detected);
      else applyThinkingPatch(detected);
      return;
    }

    if (target === 'subagents') {
      if (restore) restoreSubagentPatch(detected);
      else if (dryRun) dryRunSubagentPatch(detected);
      else applySubagentPatch(detected);
      return;
    }
  }

  if (command === 'run-script') {
    const scriptPath = args[1] && resolve(args[1]);
    if (!scriptPath || !existsSync(scriptPath)) {
      console.error('run-script requires an existing script path.');
      process.exit(1);
    }
    console.error('External script execution is intentionally not implemented.');
    process.exit(1);
  }

  printHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
