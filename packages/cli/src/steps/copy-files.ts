import fs from 'fs';
import path from 'path';
import type { Step } from '../types.js';
import { manifest } from '../manifest.js';

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export const copyFiles: Step = {
  label: '.claude/skills/kitten-bot/ ready',
  run({ bundleDir, skillDir }) {
    for (const dir of manifest.dirs) {
      copyDir(path.join(bundleDir, dir), path.join(skillDir, dir));
    }
    for (const file of manifest.files) {
      const dest = path.join(skillDir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(bundleDir, file), dest);
    }
  },
};
