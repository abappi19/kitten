import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import {
    askName,
    askLanguage,
    askToken,
    askBranch,
    askDestination,
    close,
} from './prompts.js';
import { runPipeline } from './runner.js';
import { stepsFor } from './steps/index.js';
import type { InstallContext, Scope } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BANNER = `
  \x1b[1m █   ████ ███   █  kitten-bot\x1b[0m
  \x1b[1m█   █    █   █   █ by bappi\x1b[0m
  \x1b[1m █  █████████   █  https://abappi19.github.io/kitten-bot\x1b[0m
`;

const USAGE = `
  Usage: npx kitten-bot install [--local | --global]

    --local    Install into <cwd>/.claude/skills/kitten-bot/
    --global   Install into ~/.claude/skills/kitten-bot/
               (omit both flags to be prompted)
`;

function resolveScope(args: string[]): Scope | null {
    if (args.includes('--local')) return 'local';
    if (args.includes('--global')) return 'global';
    return null;
}

function skillDirFor(scope: Scope): string {
    const root = scope === 'global' ? os.homedir() : process.cwd();
    return path.join(root, '.claude', 'skills', 'kitten-bot');
}

async function install(args: string[]): Promise<void> {
    console.log(BANNER);

    const flagScope = resolveScope(args);
    const scope: Scope = flagScope ?? (await askDestination());
    const skillDir = skillDirFor(scope);

    console.log(`\n  Installing into: \x1b[36m${skillDir}\x1b[0m\n`);
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
        skillDir,
        draftDir: '_kitten-bot',
        scope,
    };

    console.log('\n  \x1b[36m→\x1b[0m Installing kitten-bot...\n');

    await runPipeline(stepsFor(scope), ctx);

    console.log('\n  \x1b[32m\x1b[1mkitten-bot installed.\x1b[0m\n');
    if (scope === 'global') {
        console.log(
            '  Available in any Claude Code session. Type /kitten-bot to start.\n',
        );
    } else {
        console.log(
            '  Start a session: open Claude Code in this project and type /kitten-bot\n',
        );
    }
}

const [, , command, ...rest] = process.argv;

if (command === 'install') {
    install(rest).catch((e: Error) => {
        console.error('\n  \x1b[31mError:\x1b[0m', e.message, '\n');
        process.exit(1);
    });
} else {
    console.log(USAGE);
    process.exit(1);
}
