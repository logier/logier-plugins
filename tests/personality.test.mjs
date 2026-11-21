// 直接测试仓库中的 getPersonality() 函数源码，不加载 node-fetch、yaml 或云崽。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'utils/getdate.js'), 'utf8');
const start = source.indexOf('export async function getPersonality()');
const end = source.indexOf('export async function gpt(', start);
assert.ok(start !== -1 && end > start, 'getPersonality() source boundaries not found');
const functionSource = source.slice(start, end).replace(/^export\s+/, '') + '\ngetPersonality;';

function loadFunction(config, defaultPersonalities = {}) {
  return runInNewContext(functionSource, {
    setting: { getConfig: (key) => {
      assert.equal(key, 'GPTconfig');
      return config;
    } },
    readAndParseJSON: async (path) => {
      assert.equal(path, '../data/personality.json');
      return defaultPersonalities;
    },
  });
}

test('custom personality: repeated calls return isolated arrays and message objects', async () => {
  const original = [{ role: 'system', content: 'You are helpful' }];
  const getPersonality = loadFunction({ DefaultPersonalitySwitch: false, CustomPersonality: original });
  const first = await getPersonality();
  first.push({ role: 'user', content: 'hello' });
  first[0].content = 'changed';
  const second = await getPersonality();
  assert.equal(original.length, 1);
  assert.equal(original[0].content, 'You are helpful');
  assert.equal(second.length, 1);
  assert.equal(second[0].content, 'You are helpful');
  assert.notEqual(first, second);
  assert.notEqual(second[0], original[0]);
});

test('default personality: mutation does not pollute JSON-derived data', async () => {
  const defaults = { friendly: [{ role: 'system', content: 'friendly' }] };
  const getPersonality = loadFunction({ DefaultPersonalitySwitch: true, DefaultPersonality: 'friendly' }, defaults);
  const first = await getPersonality();
  first.push({ role: 'user', content: 'poke' });
  first[0].content = 'modified';
  const second = await getPersonality();
  assert.equal(second.length, 1);
  assert.equal(second[0].content, 'friendly');
  assert.equal(defaults.friendly[0].content, 'friendly');
});

test('missing custom personality falls back to an empty array', async () => {
  const getPersonality = loadFunction({ DefaultPersonalitySwitch: false });
  assert.deepEqual(Array.from(await getPersonality()), []);
});

test('missing default personality falls back to an empty array', async () => {
  const getPersonality = loadFunction({ DefaultPersonalitySwitch: true, DefaultPersonality: 'not-found' }, {});
  assert.deepEqual(Array.from(await getPersonality()), []);
});
