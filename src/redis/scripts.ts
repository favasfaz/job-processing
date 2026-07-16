import fs from 'fs';
import path from 'path';
import { redis } from './client';

const root = path.resolve(__dirname, '../../lua');

const scriptFiles = ['enqueue.lua','dequeue.lua','ack.lua','nack.lua'];

export async function loadScripts(): Promise<void> {
  for (const script of scriptFiles) {
    const content = fs.readFileSync(path.join(root, script), 'utf8');
    await redis.defineCommand(script.replace('.lua', ''), {
      numberOfKeys: 0,
      lua: content,
    });
  }
}
