import fs from 'fs';
import type { Step } from '../types.js';

const ENTRY   = '_kitten-bot/';
const COMMENT = '# kitten-bot drafts';

export const updateGitignore: Step = {
  label: '.gitignore updated',
  run() {
    const gitignorePath = '.gitignore';
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes(ENTRY)) {
        fs.appendFileSync(gitignorePath, `\n${COMMENT}\n${ENTRY}\n`);
      }
    } else {
      fs.writeFileSync(gitignorePath, `${COMMENT}\n${ENTRY}\n`);
    }
  },
};
