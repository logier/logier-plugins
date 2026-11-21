// 离线静态检查：只用 Node.js 内置模块，不依赖云崽或 npm install。
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoreDirs = new Set(['.git', 'node_modules', '.github', 'coverage']);
const jsFiles = [];
const jsonFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walk(fullPath);
    } else if (entry.isFile()) {
      if (/\.(?:js|mjs|cjs)$/.test(entry.name)) jsFiles.push(fullPath);
      else if (entry.name.endsWith('.json')) jsonFiles.push(fullPath);
    }
  }
}

walk(root);
let errors = 0;
for (const file of jsFiles) {
  // 原仓库没有 package.json；通过 stdin 强制按 ESM 检查 .js，避免运行插件导入和 Bot 全局对象。
  const source = readFileSync(file, 'utf8');
  const mode = file.endsWith('.cjs') ? 'commonjs' : 'module';
  const result = spawnSync(process.execPath, ['--check', `--input-type=${mode}`], {
    input: source,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    errors++;
    console.error(`✗ JS ${relative(root, file)}\n${result.stderr.trim()}`);
  }
}
for (const file of jsonFiles) {
  try {
    JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    errors++;
    console.error(`✗ JSON ${relative(root, file)}: ${error.message}`);
  }
}
console.log(`Checked ${jsFiles.length} JavaScript files and ${jsonFiles.length} JSON files; errors: ${errors}`);
if (errors > 0) process.exitCode = 1;
