// 表情包保存的独立工具：不依赖云崽，可直接运行 Node.js 单元测试。
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { mkdir, readdir, open, unlink } from 'node:fs/promises';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const MIME_EXTENSIONS = Object.freeze({
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
});
const IMAGE_FILENAME = /^([1-9]\d*)\.(jpe?g|png|gif|webp|bmp)$/i;
// 同一目录的编号分配需要串行，否则并发保存会抢到同一个编号。
const directoryLocks = new Map();

export function imageNumbers(files) {
  return [...new Set(files.flatMap((file) => {
    const match = IMAGE_FILENAME.exec(file);
    if (!match) return [];
    const number = Number(match[1]);
    return Number.isSafeInteger(number) ? [number] : [];
  }))].sort((a, b) => a - b);
}

export function findImageFile(files, number) {
  if (!Number.isSafeInteger(number) || number <= 0) return null;
  return files.find((file) => {
    const match = IMAGE_FILENAME.exec(file);
    return match && Number(match[1]) === number;
  }) ?? null;
}

export function generateRanges(numbers) {
  const sorted = [...new Set(numbers.filter((n) => Number.isSafeInteger(n) && n > 0))].sort((a, b) => a - b);
  const ranges = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    ranges.push(start === sorted[i] ? String(start) : `${start}-${sorted[i]}`);
  }
  return ranges.join(', ');
}

export function imageUrlsFromMessage(message) {
  if (!Array.isArray(message)) return [];
  return message
    .filter((item) => item?.type === 'image' || item?.type === 'mface')
    .map((item) => item.url ?? item.file)
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url));
}

async function withDirectoryLock(dir, fn) {
  const previous = directoryLocks.get(dir) ?? Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  directoryLocks.set(dir, current);
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (directoryLocks.get(dir) === current) directoryLocks.delete(dir);
  }
}

function getImageResponse(input, timeoutMs, redirects = 0) {
  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(input);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('只支持 HTTP(S) 图片地址');
    } catch (error) {
      reject(error);
      return;
    }
    const client = url.protocol === 'https:' ? https : http;
    const request = client.get(url, (response) => {
      const status = response.statusCode ?? 0;
      if ([301, 302, 303, 307, 308].includes(status)) {
        response.resume();
        if (!response.headers.location || redirects >= 5) {
          reject(new Error('图片重定向次数过多或缺少目标地址'));
          return;
        }
        try {
          const next = new URL(response.headers.location, url).toString();
          resolve(getImageResponse(next, timeoutMs, redirects + 1));
        } catch (error) {
          reject(error);
        }
        return;
      }
      if (status !== 200) {
        response.resume();
        reject(new Error(`图片下载失败：HTTP ${status}`));
        return;
      }
      resolve(response);
    });
    request.setTimeout(timeoutMs, () => request.destroy(new Error('图片下载超时')));
    request.on('error', reject);
  });
}

/** 下载图片，分配未使用的数字编号；失败时删除不完整文件。返回文件编号。 */
export async function saveImage(url, saveDir, { maxBytes = 20 * 1024 * 1024, timeoutMs = 15000 } = {}) {
  if (typeof saveDir !== 'string' || !saveDir.trim()) throw new Error('未配置图片保存目录');
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) throw new Error('maxBytes 必须为正数');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs 必须为正数');
  const directory = path.resolve(saveDir);
  return withDirectoryLock(directory, async () => {
    await mkdir(directory, { recursive: true });
    const response = await getImageResponse(url, timeoutMs);
    const mime = String(response.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    const extension = MIME_EXTENSIONS[mime];
    if (!extension) {
      response.destroy();
      throw new Error(`不支持的图片类型：${mime || '未提供 Content-Type'}`);
    }
    const contentLength = Number(response.headers['content-length']);
    if (contentLength > maxBytes) {
      response.destroy();
      throw new Error('图片超过大小限制');
    }

    let filePath;
    let handle;
    try {
      const occupied = new Set(imageNumbers(await readdir(directory)));
      let number = 1;
      while (occupied.has(number)) number++;
      filePath = path.join(directory, `${number}.${extension}`);
      handle = await open(filePath, 'wx');
      let received = 0;
      const limit = new Transform({
        transform(chunk, encoding, callback) {
          received += chunk.length;
          callback(received > maxBytes ? new Error('图片超过大小限制') : null, chunk);
        },
      });
      await pipeline(response, limit, handle.createWriteStream());
      return number;
    } catch (error) {
      response.destroy();
      if (handle && filePath) await unlink(filePath).catch(() => {});
      throw error;
    }
  });
}
