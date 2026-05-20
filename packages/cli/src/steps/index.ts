import type { Step, Scope } from '../types.js';
import { copyFiles } from './copy-files.js';
import { writeConfig } from './write-config.js';
import { writeEnv } from './write-env.js';
import { createDraft } from './create-draft.js';
import { updateGitignore } from './update-gitignore.js';

const LOCAL_STEPS: Step[] = [
    copyFiles,
    writeConfig,
    writeEnv,
    createDraft,
    updateGitignore,
];

const GLOBAL_STEPS: Step[] = [copyFiles, writeConfig, writeEnv];

export function stepsFor(scope: Scope): Step[] {
    return scope === 'global' ? GLOBAL_STEPS : LOCAL_STEPS;
}
