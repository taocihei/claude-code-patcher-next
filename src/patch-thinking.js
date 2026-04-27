import { ensureBackup, readCli, restoreBackup, writeCli } from './patch-utils.js';

const patches = [
  {
    name: 'Thinking banner removal for Claude Code 2.0.62',
    search: 'function ZT2({streamMode:A}){let[Q,B]=rTA.useState(null),[G,Z]=rTA.useState(null);if(rTA.useEffect(()=>{if(A==="thinking"&&Q===null)B(Date.now());else if(A!=="thinking"&&Q!==null)Z(Date.now()-Q),B(null)},[A,Q]),A==="thinking")return GP.createElement(P,{marginTop:1},GP.createElement($,{dimColor:!0},"⌛ Thinking…"));if(G!==null)return GP.createElement(P,{marginTop:1},GP.createElement($,{dimColor:!0},"✻ Thought for ",Math.max(1,Math.round(G/1000)),"s (",GP.createElement($,{dimColor:!0,bold:!0},"ctrl+o")," ","to show thinking)"));return null}',
    replacement: 'function ZT2({streamMode:A}){return null}',
  },
  {
    name: 'Thinking visibility for Claude Code 2.0.62',
    search: 'case"thinking":if(!F&&!G)return null;return J3.createElement(X59,{addMargin:Q,param:A,isTranscriptMode:F,verbose:G});',
    replacement: 'case"thinking":return J3.createElement(X59,{addMargin:Q,param:A,isTranscriptMode:!0,verbose:G});',
  },
];

function analyze(content) {
  return patches.map((patch) => {
    if (content.includes(patch.search)) return { ...patch, status: 'ready' };
    if (content.includes(patch.replacement)) return { ...patch, status: 'applied' };
    return { ...patch, status: 'not-found' };
  });
}

function printResults(results, dryRun) {
  for (const result of results) {
    const status = result.status === 'ready' && dryRun
      ? 'would apply'
      : result.status;
    console.log(`- ${result.name}: ${status}`);
  }
}

export function dryRunThinkingPatch(detected) {
  const content = readCli(detected);
  printResults(analyze(content), true);
}

export function applyThinkingPatch(detected) {
  let content = readCli(detected);
  const results = analyze(content);
  const ready = results.filter((result) => result.status === 'ready');

  if (ready.length === 0) {
    printResults(results, false);
    console.log('No thinking patches were applied.');
    return;
  }

  const backupPath = ensureBackup(detected.cliPath, 'thinking');
  for (const patch of ready) {
    content = content.replace(patch.search, patch.replacement);
  }
  writeCli(detected, content);
  printResults(results, false);
  console.log(`Backup: ${backupPath}`);
}

export function restoreThinkingPatch(detected) {
  const backupPath = restoreBackup(detected.cliPath, 'thinking');
  console.log(`Restored: ${backupPath}`);
}
