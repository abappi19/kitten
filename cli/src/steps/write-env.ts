import fs from 'fs';
import type { Step } from '../types.js';

export const writeEnv: Step = {
  label: '.env written (chmod 600)',
  run({ config, skillDir }) {
    const envPath = `${skillDir}/.env`;
    fs.writeFileSync(envPath, `GITHUB_TOKEN=${config.token}\n`);
    fs.chmodSync(envPath, 0o600);
  },
};
