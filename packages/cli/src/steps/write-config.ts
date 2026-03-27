import fs from 'fs';
import type { Step } from '../types.js';

export const writeConfig: Step = {
    label: 'config.json written',
    run({ config, skillDir }) {
        const json = {
            initialized: true,
            user_name: config.userName,
            communication_language: config.commLang,
            supported_languages: ['English', 'Bangla'],
            repo: 'https://github.com/abappi19/kitten',
            branch: config.branch,
            branches: ['main', 'dev', 'beta'],
        };
        fs.writeFileSync(
            `${skillDir}/config.json`,
            JSON.stringify(json, null, 2) + '\n',
        );
    },
};
