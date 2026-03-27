/**
 * build.ts — copies local skill files into cli/public/ for bundling.
 *
 * Source: <repo>/.claude/skills/kitten-bot/
 * Dest:   <repo>/cli/public/
 *
 * Usage (run from cli/):  bun run build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { manifest } from '../src/manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.join(
    __dirname,
    '..',
    '..',
    '.claude',
    'skills',
    'kitten-bot',
);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
    console.error('  \x1b[31mError:\x1b[0m GITHUB_TOKEN env var is required');
    process.exit(1);
}

const SKIP = new Set(['__pycache__', '.DS_Store', '.gitkeep']);
const skip = (name: string) => SKIP.has(name) || name.startsWith('.');

function copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (skip(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(
                `  \x1b[32m✓\x1b[0m ${path.relative(SKILL_ROOT, srcPath)}`,
            );
        }
    }
}

function copyFile(relPath: string): void {
    const src = path.join(SKILL_ROOT, relPath);
    const dest = path.join(PUBLIC_DIR, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  \x1b[32m✓\x1b[0m ${relPath}`);
}

const KLOAD_AUTH_PLACEHOLDER = "_AUTH_V    = ''";

function patchKLoad(token: string): void {
    const kloadPath = path.join(PUBLIC_DIR, 'scripts', 'k_load.py');
    const encoded = Buffer.from(token).toString('base64');

    let src = fs.readFileSync(kloadPath, 'utf-8');
    if (!src.includes(KLOAD_AUTH_PLACEHOLDER)) {
        throw new Error(
            'k_load.py _AUTH_V placeholder not found — patch target may have changed',
        );
    }
    src = src.replace(KLOAD_AUTH_PLACEHOLDER, `_AUTH_V    = '${encoded}'`);
    fs.writeFileSync(kloadPath, src, 'utf-8');
    console.log(
        '  \x1b[32m✓\x1b[0m scripts/k_load.py patched with build-time token',
    );
}

function run(): void {
    console.log('\n  \x1b[1mBundling skill files → public/\x1b[0m\n');

    if (fs.existsSync(PUBLIC_DIR)) {
        fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });

    for (const dir of manifest.dirs) {
        copyDir(path.join(SKILL_ROOT, dir), path.join(PUBLIC_DIR, dir));
    }

    for (const file of manifest.files) {
        copyFile(file);
    }

    patchKLoad(TOKEN!);

    console.log('\n  \x1b[32m\x1b[1mDone.\x1b[0m\n');
}

run();
