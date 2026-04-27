import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { ensureBackup, readCli, restoreBackup, writeCli } from './patch-utils.js';

function configPath() {
  return join(os.homedir(), '.claude', 'subagent-models.json');
}

function readModelConfig() {
  try {
    return JSON.parse(readFileSync(configPath(), 'utf8'));
  } catch {
    return null;
  }
}

function buildPatches(config) {
  const patches = [];

  if (config.Plan) {
    patches.push({
      name: 'Plan agent model',
      search: 'a3A={agentType:"Plan",whenToUse:Sw.whenToUse,disallowedTools:Sw.disallowedTools,systemPrompt:Sw.systemPrompt,source:"built-in",tools:Sw.tools,baseDir:"built-in",model:"sonnet"}',
      replacement: `a3A={agentType:"Plan",whenToUse:Sw.whenToUse,disallowedTools:Sw.disallowedTools,systemPrompt:Sw.systemPrompt,source:"built-in",tools:Sw.tools,baseDir:"built-in",model:"${config.Plan}"}`,
    });
  }

  if (config.Explore) {
    patches.push({
      name: 'Explore agent model',
      search: 'Complete the user\'s search request efficiently and report your findings clearly.`,source:"built-in",baseDir:"built-in",model:"haiku"}});var a3A;',
      replacement: `Complete the user's search request efficiently and report your findings clearly.\`,source:"built-in",baseDir:"built-in",model:"${config.Explore}"}});var a3A;`,
    });
  }

  if (config['general-purpose']) {
    patches.push({
      name: 'general-purpose agent model',
      regex: /Y01=\{agentType:"general-purpose"[^}]*\}/,
      replacement(match) {
        if (match.includes(',model:"')) {
          return match.replace(/,model:"[^"]+"/g, `,model:"${config['general-purpose']}"`);
        }
        return match.replace(/}$/, `,model:"${config['general-purpose']}"}`);
      },
    });
  }

  return patches;
}

function analyze(content, patches) {
  return patches.map((patch) => {
    if (patch.regex) {
      const match = content.match(patch.regex);
      if (!match) return { ...patch, status: 'not-found' };
      return patch.replacement(match[0]) === match[0]
        ? { ...patch, status: 'applied' }
        : { ...patch, status: 'ready' };
    }

    if (content.includes(patch.search)) return { ...patch, status: 'ready' };
    if (content.includes(patch.replacement)) return { ...patch, status: 'applied' };
    return { ...patch, status: 'not-found' };
  });
}

function getConfiguredPatches() {
  const config = readModelConfig();
  if (!config) {
    throw new Error(`No model configuration found. Create ${configPath()} first.`);
  }
  return buildPatches(config);
}

function printResults(results, dryRun) {
  for (const result of results) {
    const status = result.status === 'ready' && dryRun
      ? 'would apply'
      : result.status;
    console.log(`- ${result.name}: ${status}`);
  }
}

export function dryRunSubagentPatch(detected) {
  const content = readCli(detected);
  const patches = getConfiguredPatches();
  printResults(analyze(content, patches), true);
}

export function applySubagentPatch(detected) {
  let content = readCli(detected);
  const patches = getConfiguredPatches();
  const results = analyze(content, patches);
  const ready = results.filter((result) => result.status === 'ready');

  if (ready.length === 0) {
    printResults(results, false);
    console.log('No subagent patches were applied.');
    return;
  }

  const backupPath = ensureBackup(detected.cliPath, 'subagents');
  for (const patch of ready) {
    if (patch.regex) {
      content = content.replace(patch.regex, patch.replacement);
    } else {
      content = content.replace(patch.search, patch.replacement);
    }
  }
  writeCli(detected, content);
  printResults(results, false);
  console.log(`Backup: ${backupPath}`);
}

export function restoreSubagentPatch(detected) {
  const backupPath = restoreBackup(detected.cliPath, 'subagents');
  console.log(`Restored: ${backupPath}`);
}
