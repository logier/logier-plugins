import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { listsEqual, parseEmojiList, mergeEmojiList, normalizeRate } from '../utils/emoji-thief.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'apps/EmojiThief.js'), 'utf8');
const classSource = source.replace(/^import .*;?\r?\n/gm, '').replace('export class TextMsg', 'class TextMsg');

function makePlugin(config, { random = 0.5, emojiUrl = 'https://example.com/fallback.png' } = {}) {
  const data = new Map();
  const sent = [];
  const errors = [];
  let fallbackCalls = 0;
  let redisGets = 0;
  const Plugin = runInNewContext(`${classSource}\nTextMsg`, {
    plugin: class { constructor(opts) { this.options = opts; } },
    setting: { getConfig: () => config },
    listsEqual, mergeEmojiList, parseEmojiList, normalizeRate,
    redis: {
      get: async (key) => { redisGets++; return data.get(key) ?? null; },
      set: async (key, value) => { data.set(key, value); },
    },
    getemoji: async () => { fallbackCalls++; return emojiUrl; },
    logger: { info() {}, error: (message) => errors.push(message) },
    segment: { image: (url) => url },
    Math: Object.assign(Object.create(Math), { random: () => random }),
  });
  return {
    instance: new Plugin(), data, sent, errors,
    get fallbackCalls() { return fallbackCalls; },
    get redisGets() { return redisGets; },
    event: (message, group_id = 123) => ({ group_id, message, reply: async (msg) => sent.push(msg) }),
  };
}

test('Redis corrupted data is ignored; list remains unique and bounded to 50', () => {
  assert.deepEqual(parseEmojiList('invalid json'), []);
  assert.deepEqual(parseEmojiList('{}'), []);
  const items = Array.from({ length: 60 }, (_, i) => `url-${i}`);
  assert.deepEqual(mergeEmojiList(null, items), items.slice(-50));
  assert.deepEqual(mergeEmojiList(JSON.stringify(['a', 'a']), ['a', 'b']), ['a', 'b']);
  assert.deepEqual(mergeEmojiList(null, 'not-an-array'), []);
  assert.equal(listsEqual(['a', 'b'], ['a', 'b']), true);
  assert.equal(listsEqual(['a'], ['b']), false);
  assert.equal(normalizeRate('0.5'), 0.5);
  assert.equal(normalizeRate(2), 1);
  assert.equal(normalizeRate(-1), 0);
  assert.equal(normalizeRate(undefined, 0.5), 0.5);
  assert.equal(normalizeRate('broken', 2), 1);
});

test('emoji list keeps only the newest 50 entries', () => {
  const full = Array.from({ length: 50 }, (_, i) => `u${i}`);
  assert.deepEqual(mergeEmojiList(full, ['n1', 'n2']), [...full.slice(2), 'n1', 'n2']);
  assert.equal(mergeEmojiList(full, ['u49']).length, 50);
});

test('one message with multiple emoji images is saved completely and reads Redis once', async () => {
  const ctx = makePlugin({ DefalutReplyRate: 0, DefalutEmojiRate: 0, ETGroupRate: [] });
  const message = [
    { type: 'image', asface: true, url: 'https://example.com/1.png' },
    { type: 'image', asface: true, url: 'https://example.com/2.png' },
    { type: 'image', asface: true, url: 'https://example.com/1.png' },
  ];
  await ctx.instance.表情包小偷(ctx.event(message));
  const stored = JSON.parse(ctx.data.get('Yunzai:EmojiThief:123_EmojiThief'));
  assert.deepEqual(stored, ['https://example.com/1.png', 'https://example.com/2.png']);
  assert.equal(ctx.sent.length, 0);
  assert.equal(ctx.redisGets, 1);
});

test('rate 0 without images skips Redis entirely', async () => {
  const ctx = makePlugin({ DefalutReplyRate: 0, DefalutEmojiRate: 0, ETGroupRate: [] });
  await ctx.instance.表情包小偷(ctx.event([]));
  assert.equal(ctx.redisGets, 0);
});

test('group override accepts numeric/string group ids; cache reply avoids fallback request', async () => {
  const ctx = makePlugin({
    DefalutReplyRate: 0, DefalutEmojiRate: 1,
    ETGroupRate: [{ groupList: ['123'], rate: 1, EmojiRate: 0 }],
  });
  ctx.data.set('Yunzai:EmojiThief:123_EmojiThief', JSON.stringify(['https://example.com/cached.png']));
  await ctx.instance.表情包小偷(ctx.event([]));
  assert.equal(ctx.sent[0][0], 'https://example.com/cached.png');
  assert.equal(ctx.fallbackCalls, 0);
});

test('no reply is sent for private messages, unmatched groups or missing fallback image', async () => {
  const ctx = makePlugin({
    DefalutReplyRate: 1, DefalutEmojiRate: 1,
    ETGroupRate: [{ groupList: [123], rate: 1, EmojiRate: 1 }],
  }, { emojiUrl: null });
  await ctx.instance.表情包小偷(ctx.event([], null));
  await ctx.instance.表情包小偷(ctx.event([], 456));
  await ctx.instance.表情包小偷(ctx.event([]));
  assert.equal(ctx.sent.length, 0);
});
