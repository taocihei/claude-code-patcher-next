import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

export function requireLegacyLayout(detected) {
  if (detected.layout !== 'legacy-js' || !detected.cliPath) {
    const info = detected.packageInfo;
    throw new Error([
      'This patch requires the legacy Claude Code cli.js layout.',
      `Detected layout: ${detected.layout}`,
      `Detected version: ${info?.version || 'unknown'}`,
      info?.binPath ? `Detected binary: ${info.binPath}` : null,
      'Claude Code 2.1.x native binaries are not patched by this tool.',
    ].filter(Boolean).join('\n'));
  }
}

export function readCli(detected) {
  requireLegacyLayout(detected);
  return readFileSync(detected.cliPath, 'utf8');
}

export function writeCli(detected, content) {
  requireLegacyLayout(detected);
  writeFileSync(detected.cliPath, content, 'utf8');
}

export function ensureBackup(filePath, suffix) {
  const backupPath = `${filePath}.${suffix}.backup`;
  if (!existsSync(backupPath)) {
    copyFileSync(filePath, backupPath);
  }
  return backupPath;
}

export function restoreBackup(filePath, suffix) {
  const backupPath = `${filePath}.${suffix}.backup`;
  if (!existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupPath}`);
  }
  copyFileSync(backupPath, filePath);
  return backupPath;
}
