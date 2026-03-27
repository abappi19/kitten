import path from 'path';
import { fileURLToPath } from 'url';
import { askName, askLanguage, askToken, askBranch, close } from './prompts.js';
import { runPipeline } from './runner.js';
import { steps } from './steps/index.js';
import type { InstallContext } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BANNER = `
  \x1b[1m █   ████ ███   █  kitten-bot\x1b[0m
  \x1b[1m█   █    █   █   █ by bappi\x1b[0m
  \x1b[1m █  █████████   █  https://abappi19.github.io/kitten-bot\x1b[0m
`;

async function install(): Promise<void> {
    console.log(BANNER);
    console.log(`  Installing into: \x1b[36m${process.cwd()}\x1b[0m\n`);
    console.log('  \x1b[1mA few things before we start:\x1b[0m\n');

    const config = {
        userName: await askName(),
        commLang: await askLanguage(),
        token: await askToken(),
        branch: await askBranch(),
    };

    close();

    const ctx: InstallContext = {
        config,
        bundleDir: path.join(__dirname, '..', 'public'),
        skillDir: '.claude/skills/kitten-bot',
        draftDir: '_kitten-bot',
    };

    console.log('\n  \x1b[36m→\x1b[0m Installing kitten-bot...\n');

    await runPipeline(steps, ctx);

    console.log('\n  \x1b[32m\x1b[1mkitten-bot installed.\x1b[0m\n');
    console.log(
        '  Start a session: open Claude Code in this project and type /kitten-bot\n',
    );
}

const [, , command] = process.argv;

if (command === 'install') {
    install().catch((e: Error) => {
        console.error('\n  \x1b[31mError:\x1b[0m', e.message, '\n');
        process.exit(1);
    });
} else {
    console.log('\n  Usage: npx kitten-bot install\n');
    process.exit(1);
}
