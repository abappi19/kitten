import fs from 'fs';
import type { Step } from '../types.js';

const README = `# _kitten-bot

This directory is kitten-bot's drafting workspace for this project.

When kitten-bot is about to make a significant change, it stages a draft here first.
Review the draft, then confirm to apply it to the actual source files.

**Do not commit this directory.** It is listed in .gitignore.
`;

export const createDraft: Step = {
    label: '_kitten-bot/ created',
    run({ draftDir }) {
        fs.mkdirSync(draftDir, { recursive: true });
        fs.writeFileSync(`${draftDir}/README.md`, README);
    },
};
