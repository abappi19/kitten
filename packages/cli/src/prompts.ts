import readline from 'readline';
import type { CommLang, Branch } from './types.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res));

const askSecret = (q: string): Promise<string> =>
  new Promise((res) => {
    process.stdout.write(q);
    process.stdin.setRawMode(true);
    let value = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function handler(ch: string) {
      if (ch === '\n' || ch === '\r' || ch === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        process.stdout.write('\n');
        res(value);
      } else if (ch === '\u0003') {
        process.exit();
      } else if (ch === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    });
  });

export async function askName(): Promise<string> {
  while (true) {
    const name = (await ask('  Your name (used in responses): ')).trim();
    if (name) return name;
    console.log('  ! Name cannot be empty.');
  }
}

export async function askLanguage(): Promise<CommLang> {
  console.log('');
  console.log('  kitten-bot communicates in English or Bangla only.');
  while (true) {
    const input = (await ask('  Preferred language [English / Bangla]: ')).trim().toLowerCase();
    if (input === 'english' || input === 'en') return 'English';
    if (input === 'bangla' || input === 'bn' || input === 'বাংলা') return 'Bangla';
    console.log("  ! Please enter 'English' or 'Bangla'.");
  }
}

export async function askToken(): Promise<string> {
  console.log('');
  console.log('  kitten-bot fetches reference files from GitHub on demand.');
  console.log('  A Personal Access Token with read scope is required.');
  console.log('  Create one at: https://github.com/settings/tokens');
  console.log('');
  while (true) {
    const token = (await askSecret('  GitHub Personal Access Token: ')).trim();
    if (token) return token;
    console.log('  ! Token cannot be empty.');
  }
}

export async function askBranch(): Promise<Branch> {
  console.log('');
  console.log('  Which branch should kitten-bot load references from?');
  console.log('    main  — stable / production knowledge (recommended)');
  console.log('    dev   — latest updates, may be in progress');
  console.log('    beta  — preview content');
  while (true) {
    const input = ((await ask('  Branch [main]: ')).trim() || 'main') as Branch;
    if (['main', 'dev', 'beta'].includes(input)) return input;
    console.log('  ! Choose from: main, dev, beta.');
  }
}

export const close = (): void => rl.close();
