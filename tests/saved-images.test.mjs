import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  saveImage, imageNumbers, findImageFile, generateRanges, imageUrlsFromMessage,
} from '../utils/saved-images.mjs';

const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489', 'hex');

async function withServer(fn) {
  const server = createServer((req, res) => {
    if (req.url === '/redirect') {
      res.writeHead(302, { location: '/png' }).end();
    } else if (req.url === '/missing') {
      res.writeHead(404).end('not found');
    } else if (req.url === '/html') {
      res.writeHead(200, { 'content-type': 'text/html' }).end('<html></html>');
    } else if (req.url === '/oversize') {
      res.writeHead(200, { 'content-type': 'image/png' }).end(Buffer.alloc(100));
    } else {
      res.writeHead(200, { 'content-type': 'image/png; charset=binary' }).end(png);
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { await new Promise((resolve) => server.close(resolve)); }
}

async function withTempDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'logier-image-test-'));
  try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

test('image numbers exclude unrelated files, de-duplicate and display ranges', () => {
  assert.deepEqual(imageNumbers(['1.jpg', '1.png', '2.gif', '4.webp', 'README.txt', '5.bak', '0.jpg']), [1, 2, 4]);
  assert.equal(generateRanges([4, 1, 2, 2, 7, 8]), '1-2, 4, 7-8');
  assert.equal(findImageFile(['README.txt', '2.png'], 2), '2.png');
  assert.equal(findImageFile(['2.bak'], 2), null);
});

test('image URLs are extracted from quoted message segments', () => {
  assert.deepEqual(imageUrlsFromMessage([
    { type: 'text', text: 'hi' },
    { type: 'image', url: 'https://example.com/a.png' },
    { type: 'image', file: 'http://example.com/b.png' },
    { type: 'image', url: 'file:///tmp/test.png' },
    { type: 'mface', url: 'https://example.com/c.png' },
  ]), ['https://example.com/a.png', 'http://example.com/b.png', 'https://example.com/c.png']);
});

test('saveImage handles redirect and writes only a valid image extension', async () => {
  await withServer(async (base) => withTempDir(async (dir) => {
    assert.equal(await saveImage(`${base}/redirect`, dir), 1);
    assert.deepEqual(await readdir(dir), ['1.png']);
    assert.deepEqual(await readFile(join(dir, '1.png')), png);
  }));
});

test('saveImage never leaves partial files after bad response or oversized body', async () => {
  await withServer(async (base) => withTempDir(async (dir) => {
    await assert.rejects(saveImage(`${base}/missing`, dir), /HTTP 404/);
    await assert.rejects(saveImage(`${base}/html`, dir), /不支持的图片类型/);
    await assert.rejects(saveImage(`${base}/oversize`, dir, { maxBytes: 32 }), /大小限制/);
    assert.deepEqual(await readdir(dir), []);
  }));
});

test('concurrent saves allocate distinct numbers', async () => {
  await withServer(async (base) => withTempDir(async (dir) => {
    const numbers = await Promise.all(Array.from({ length: 5 }, () => saveImage(`${base}/png`, dir)));
    assert.deepEqual(numbers.sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    assert.equal((await readdir(dir)).length, 5);
  }));
});

test('saveImage rejects invalid protocols and missing directories', async () => {
  await assert.rejects(saveImage('file:///etc/passwd', '/tmp/unused'), /只支持 HTTP\(S\)/);
  await assert.rejects(saveImage('https://example.com/test.png', ''), /未配置/);
});
