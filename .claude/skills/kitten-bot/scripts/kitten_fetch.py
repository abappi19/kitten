#!/usr/bin/env python3
"""
kitten_fetch.py

Fetches any file from the kitten-bot GitHub repo using the GitHub Contents API.
Reads repo and branch from config.json (in the skill root).
GITHUB_TOKEN must be set in .env at the project root. No fallbacks.

Usage (run from skill root):
  python -m scripts.kitten_fetch <file-path> [branch]
  python -m scripts.kitten_fetch references/kitten/stack.md
  python -m scripts.kitten_fetch agents/identity.md dev

Output:
  Decoded file content printed to stdout.
"""

import sys
import json
import base64
import ssl
import urllib.request
from pathlib import Path


def ssl_context() -> ssl.SSLContext:
    # Try platform cert bundles in order — Python.org builds don't bundle certs
    candidates = [
        "/etc/ssl/cert.pem",                          # macOS + some Linux
        "/etc/ssl/certs/ca-certificates.crt",         # Debian/Ubuntu
        "/etc/pki/tls/certs/ca-bundle.crt",           # RHEL/Fedora
        "/etc/ssl/ca-bundle.pem",                     # OpenSUSE
    ]
    for path in candidates:
        if Path(path).exists():
            return ssl.create_default_context(cafile=path)
    # Fall back to default (works when Python was installed with certs)
    return ssl.create_default_context()

# --- Paths (cwd = skill root because caller does: cd {skill_dir} && python -m ...) ---

skill_dir = Path.cwd()
config_path = skill_dir / "config.json"

# Walk up from skill_dir to find .env
def find_env(start: Path) -> Path | None:
    for parent in [start, *start.parents]:
        candidate = parent / ".env"
        if candidate.exists():
            return candidate
    return None

# --- Config ---

if not config_path.exists():
    print(f"Error: config.json not found at {config_path}", file=sys.stderr)
    sys.exit(1)

with open(config_path) as f:
    config = json.load(f)

repo = config["repo"]
default_branch = config.get("branch", "main")

# --- Token — strictly from .env. No fallbacks. ---

env_path = find_env(skill_dir)

if not env_path:
    print("Error: .env file not found in skill directory or any parent.", file=sys.stderr)
    sys.exit(1)

env_vars = {}
for line in env_path.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        key, _, value = line.partition("=")
        env_vars[key.strip()] = value.strip()

token = env_vars.get("GITHUB_TOKEN")

if not token:
    print("Error: GITHUB_TOKEN is not defined in .env.", file=sys.stderr)
    sys.exit(1)

# --- Args ---

if len(sys.argv) < 2:
    print("Usage: python -m scripts.kitten_fetch <file-path> [branch]", file=sys.stderr)
    print("Example: python -m scripts.kitten_fetch references/kitten/stack.md", file=sys.stderr)
    sys.exit(1)

file_path = sys.argv[1]
branch = sys.argv[2] if len(sys.argv) > 2 else default_branch

# --- Source repo detection: read local files when running inside kitten source ---

def find_repo_root(start: Path) -> "Path | None":
    for parent in [start, *start.parents]:
        if (parent / ".git").is_dir():
            return parent
    return None

def is_source_repo(root: Path) -> bool:
    git_config = root / ".git" / "config"
    if not git_config.exists():
        return False
    return "abappi19/kitten" in git_config.read_text()

repo_root = find_repo_root(skill_dir)
if repo_root and is_source_repo(repo_root):
    local_file = repo_root / file_path
    if local_file.exists():
        sys.stdout.write(local_file.read_text())
        sys.exit(0)
    else:
        print(f"kitten-fetch: local file not found at {local_file}", file=sys.stderr)
        sys.exit(1)

# --- Fetch ---

repo_path = repo.replace("https://github.com/", "")
api_url = f"https://api.github.com/repos/{repo_path}/contents/{file_path}?ref={branch}"

req = urllib.request.Request(
    api_url,
    headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "kitten-fetch",
    },
)

try:
    with urllib.request.urlopen(req, context=ssl_context()) as res:
        data = json.loads(res.read())
except ssl.SSLCertVerificationError:
    print(
        "kitten-fetch error: SSL certificate verification failed.\n"
        "Fix: run the certificate installer for your Python version.\n"
        "  macOS:  open '/Applications/Python 3.x/Install Certificates.command'\n"
        "  Linux:  sudo apt install ca-certificates  (or equivalent for your distro)\n"
        "  Any:    pip install certifi",
        file=sys.stderr,
    )
    sys.exit(1)
except urllib.error.HTTPError as e:
    print(f"kitten-fetch error: HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
    sys.exit(1)
except urllib.error.URLError as e:
    print(f"kitten-fetch error: {e.reason}", file=sys.stderr)
    sys.exit(1)

if data.get("encoding") != "base64" or not data.get("content"):
    print("kitten-fetch error: Unexpected response format from GitHub API.", file=sys.stderr)
    sys.exit(1)

content = base64.b64decode(data["content"]).decode("utf-8")
sys.stdout.write(content)
