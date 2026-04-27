import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

function safeExec(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

function safeNpmRoot() {
  const candidates = process.platform === 'win32'
    ? ['npm.cmd', 'npm']
    : ['npm'];

  for (const candidate of candidates) {
    const root = safeExec(candidate, ['root', '-g']);
    if (root) return root;
  }

  return null;
}

function readPackageInfo(packageRoot) {
  const packageJsonPath = join(packageRoot, 'package.json');
  let packageJson = {};
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  } catch {
    // Keep defaults below.
  }

  const bin = packageJson.bin?.claude;
  return {
    packageRoot,
    packageJsonPath,
    version: packageJson.version || 'unknown',
    binPath: bin ? join(packageRoot, bin) : null,
  };
}

function inspectPackageRoot(packageRoot, method, attempts) {
  const cliPath = join(packageRoot, 'cli.js');
  attempts.push({ method, path: cliPath });

  if (!existsSync(packageRoot)) return null;

  const packageInfo = readPackageInfo(packageRoot);
  if (existsSync(cliPath)) {
    return {
      found: true,
      layout: 'legacy-js',
      method,
      packageInfo,
      cliPath: realpathSync(cliPath),
    };
  }

  if (packageInfo.binPath && existsSync(packageInfo.binPath)) {
    return {
      found: true,
      layout: 'native',
      method,
      packageInfo,
      cliPath: null,
    };
  }

  return {
    found: true,
    layout: 'unknown',
    method,
    packageInfo,
    cliPath: null,
  };
}

export function detectClaudeCode() {
  const attempts = [];
  const home = os.homedir();
  const packageRoots = [
    {
      method: 'local ~/.claude',
      path: join(home, '.claude', 'local', 'node_modules', '@anthropic-ai', 'claude-code'),
    },
    {
      method: 'local ~/.config/claude',
      path: join(home, '.config', 'claude', 'local', 'node_modules', '@anthropic-ai', 'claude-code'),
    },
  ];

  const npmRoot = safeNpmRoot();
  if (npmRoot) {
    packageRoots.push({
      method: 'npm root -g',
      path: join(npmRoot, '@anthropic-ai', 'claude-code'),
    });
  }

  if (process.platform === 'win32' && process.env.APPDATA) {
    packageRoots.push({
      method: 'APPDATA npm fallback',
      path: join(process.env.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code'),
    });
  }

  packageRoots.push({
    method: 'derived from node',
    path: join(dirname(process.execPath), '..', 'lib', 'node_modules', '@anthropic-ai', 'claude-code'),
  });

  for (const root of packageRoots) {
    const result = inspectPackageRoot(root.path, root.method, attempts);
    if (result?.found) {
      return { ...result, attempts };
    }
  }

  return {
    found: false,
    layout: null,
    method: null,
    packageInfo: null,
    cliPath: null,
    attempts,
  };
}
