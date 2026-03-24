import type { Step } from '../types.js';
import { copyFiles }       from './copy-files.js';
import { writeConfig }     from './write-config.js';
import { writeEnv }        from './write-env.js';
import { createDraft }     from './create-draft.js';
import { updateGitignore } from './update-gitignore.js';

export const steps: Step[] = [
  copyFiles,
  writeConfig,
  writeEnv,
  createDraft,
  updateGitignore,
];
