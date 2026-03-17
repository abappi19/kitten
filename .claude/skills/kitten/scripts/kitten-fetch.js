#!/usr/bin/env node
/**
 * kitten-fetch.js
 *
 * Fetches any file from the kitten GitHub repo using the GitHub Contents API.
 * Reads repo and branch from config.json.
 * GITHUB_TOKEN must be set in .env at the project root. No fallbacks.
 *
 * Usage:
 *   node kitten-fetch.js <file-path> [branch]
 *   node kitten-fetch.js references/kitten/stack.md
 *   node kitten-fetch.js workflows/identity.md dev
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

// --- Token — strictly from .env at project root. No fallbacks. ---

const envPath = path.join(__dirname, '..', '..', '..', '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at project root.');
  process.exit(1);
}

const envVars = {};
fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
  });

const token = envVars['GITHUB_TOKEN'];

if (!token) {
  console.error('Error: GITHUB_TOKEN is not defined in .env.');
  process.exit(1);
}

// --- Args ---

const filePath = process.argv[2];
const branch = process.argv[3] || defaultBranch;

if (!filePath) {
  console.error('Usage: node kitten-fetch.js <file-path> [branch]');
  console.error('Example: node kitten-fetch.js references/kitten/stack.md');
  process.exit(1);
}

// --- Derive API URL ---

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
