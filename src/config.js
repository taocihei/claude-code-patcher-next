import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import os from 'node:os';

const validModels = new Set(['haiku', 'sonnet', 'opus']);

function getConfigPath() {
  return join(os.homedir(), '.claude', 'subagent-models.json');
}

function readConfig() {
  const file = getConfigPath();
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf8'));
}

function assertModel(value, key) {
  if (value === undefined) return;
  if (!validModels.has(value)) {
    throw new Error(`Invalid model for ${key}: ${value}. Valid values: haiku, sonnet, opus.`);
  }
}

export function showConfig() {
  const file = getConfigPath();
  const config = readConfig();
  console.log(`Config: ${file}`);
  console.log(JSON.stringify(config, null, 2));
}

export function writeSubagentConfig(update) {
  for (const [key, value] of Object.entries(update)) {
    assertModel(value, key);
  }

  const file = getConfigPath();
  const config = readConfig();

  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) config[key] = value;
  }

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}
