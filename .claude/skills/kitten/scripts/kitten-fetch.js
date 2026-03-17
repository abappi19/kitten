#!/usr/bin/env node
/**
 * kitten-fetch.js
 *
 * Fetches any file from the kitten GitHub repo using the GitHub Contents API.
 * Reads repo, branch, and github_token from config.json.
 * Falls back to GITHUB_TOKEN env var if config token is empty.
 *
 * Usage:
 *   node kitten-fetch.js <file-path> [branch]
 *   node kitten-fetch.js references/kitten/stack.md
 *   node kitten-fetch.js agents/bappi-expert.md dev
 *
 * Output:
 *   Decoded file content printed to stdout.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Config ---

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const repo = config.repo;
const defaultBranch = config.branch || 'main';
// Load .env from skill root if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    });
}

const token = process.env.GITHUB_TOKEN;

const filePath = process.argv[2];
const branch = process.argv[3] || defaultBranch;

if (!filePath) {
  console.error('Usage: node kitten-fetch.js <file-path> [branch]');
  console.error('Example: node kitten-fetch.js references/kitten/stack.md');
  process.exit(1);
}

if (!token) {
  console.error('Error: GITHUB_TOKEN not found in .env or environment, and github_token not set in config.json.');
  process.exit(1);
}

// --- Derive API URL ---

// https://github.com/abappi19/kitten → abappi19/kitten
const repoPath = repo.replace('https://github.com/', '');
const apiUrl = `https://api.github.com/repos/${repoPath}/contents/${filePath}?ref=${branch}`;

// --- Fetch ---

function get(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'kitten-fetch',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    const raw = await get(apiUrl);
    const json = JSON.parse(raw);

    if (json.encoding !== 'base64' || !json.content) {
      throw new Error('Unexpected response format from GitHub API.');
    }

    const content = Buffer.from(json.content, 'base64').toString('utf8');
    process.stdout.write(content);
  } catch (err) {
    console.error(`kitten-fetch error: ${err.message}`);
    process.exit(1);
  }
})();
