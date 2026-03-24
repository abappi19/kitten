#!/usr/bin/env node

// src/index.ts
import path2 from "path";
import { fileURLToPath } from "url";

// src/prompts.ts
import readline from "readline";
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
var ask = (q) => new Promise((res) => rl.question(q, res));
var askSecret = (q) => new Promise((res) => {
  process.stdout.write(q);
  process.stdin.setRawMode(true);
  let value = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function handler(ch) {
    if (ch === "\n" || ch === "\r" || ch === "") {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", handler);
      process.stdout.write("\n");
      res(value);
    } else if (ch === "") {
      process.exit();
    } else if (ch === "\x7F") {
      value = value.slice(0, -1);
    } else {
      value += ch;
    }
  });
});
async function askName() {
  while (true) {
    const name = (await ask("  Your name (used in responses): ")).trim();
    if (name) return name;
    console.log("  ! Name cannot be empty.");
  }
}
async function askLanguage() {
  console.log("");
  console.log("  kitten-bot communicates in English or Bangla only.");
  while (true) {
    const input = (await ask("  Preferred language [English / Bangla]: ")).trim().toLowerCase();
    if (input === "english" || input === "en") return "English";
    if (input === "bangla" || input === "bn" || input === "\u09AC\u09BE\u0982\u09B2\u09BE") return "Bangla";
    console.log("  ! Please enter 'English' or 'Bangla'.");
  }
}
async function askToken() {
  console.log("");
  console.log("  kitten-bot fetches reference files from GitHub on demand.");
  console.log("  A Personal Access Token with read scope is required.");
  console.log("  Create one at: https://github.com/settings/tokens");
  console.log("");
  while (true) {
    const token = (await askSecret("  GitHub Personal Access Token: ")).trim();
    if (token) return token;
    console.log("  ! Token cannot be empty.");
  }
}
async function askBranch() {
  console.log("");
  console.log("  Which branch should kitten-bot load references from?");
  console.log("    main  \u2014 stable / production knowledge (recommended)");
  console.log("    dev   \u2014 latest updates, may be in progress");
  console.log("    beta  \u2014 preview content");
  while (true) {
    const input = (await ask("  Branch [main]: ")).trim() || "main";
    if (["main", "dev", "beta"].includes(input)) return input;
    console.log("  ! Choose from: main, dev, beta.");
  }
}
var close = () => rl.close();

// src/runner.ts
var ok = (msg) => console.log(`  \x1B[32m\u2713\x1B[0m ${msg}`);
var fail = (msg) => console.error(`  \x1B[31m\u2717\x1B[0m ${msg}`);
async function runPipeline(steps2, ctx) {
  for (const step of steps2) {
    try {
      await step.run(ctx);
      ok(step.label);
    } catch (e) {
      fail(step.label);
      throw e;
    }
  }
}

// src/steps/copy-files.ts
import fs from "fs";
import path from "path";

// src/manifest.ts
var manifest = {
  /** Whole directories — copied recursively */
  dirs: ["agents", "rules", "scripts"],
  /** Individual files at the skill root */
  files: ["SKILL.md", "config.template.json"]
};

// src/steps/copy-files.ts
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
var copyFiles = {
  label: ".claude/skills/kitten-bot/ ready",
  run({ bundleDir, skillDir }) {
    for (const dir of manifest.dirs) {
      copyDir(path.join(bundleDir, dir), path.join(skillDir, dir));
    }
    for (const file of manifest.files) {
      const dest = path.join(skillDir, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(bundleDir, file), dest);
    }
  }
};

// src/steps/write-config.ts
import fs2 from "fs";
var writeConfig = {
  label: "config.json written",
  run({ config, skillDir }) {
    const json = {
      initialized: true,
      user_name: config.userName,
      communication_language: config.commLang,
      supported_languages: ["English", "Bangla"],
      repo: "https://github.com/abappi19/kitten",
      branch: config.branch,
      branches: ["main", "dev", "beta"]
    };
    fs2.writeFileSync(`${skillDir}/config.json`, JSON.stringify(json, null, 2) + "\n");
  }
};

// src/steps/write-env.ts
import fs3 from "fs";
var writeEnv = {
  label: ".env written (chmod 600)",
  run({ config, skillDir }) {
    const envPath = `${skillDir}/.env`;
    fs3.writeFileSync(envPath, `GITHUB_TOKEN=${config.token}
`);
    fs3.chmodSync(envPath, 384);
  }
};

// src/steps/create-draft.ts
import fs4 from "fs";
var README = `# _kitten-bot

This directory is kitten-bot's drafting workspace for this project.

When kitten-bot is about to make a significant change, it stages a draft here first.
Review the draft, then confirm to apply it to the actual source files.

**Do not commit this directory.** It is listed in .gitignore.
`;
var createDraft = {
  label: "_kitten-bot/ created",
  run({ draftDir }) {
    fs4.mkdirSync(draftDir, { recursive: true });
    fs4.writeFileSync(`${draftDir}/README.md`, README);
  }
};

// src/steps/update-gitignore.ts
import fs5 from "fs";
var ENTRY = "_kitten-bot/";
var COMMENT = "# kitten-bot drafts";
var updateGitignore = {
  label: ".gitignore updated",
  run() {
    const gitignorePath = ".gitignore";
    if (fs5.existsSync(gitignorePath)) {
      const content = fs5.readFileSync(gitignorePath, "utf8");
      if (!content.includes(ENTRY)) {
        fs5.appendFileSync(gitignorePath, `
${COMMENT}
${ENTRY}
`);
      }
    } else {
      fs5.writeFileSync(gitignorePath, `${COMMENT}
${ENTRY}
`);
    }
  }
};

// src/steps/index.ts
var steps = [
  copyFiles,
  writeConfig,
  writeEnv,
  createDraft,
  updateGitignore
];

// src/index.ts
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var BANNER = `
  \x1B[1m \u2588   \u2588\u2588\u2588\u2588 \u2588\u2588\u2588   \u2588  kitten-bot\x1B[0m
  \x1B[1m\u2588   \u2588    \u2588   \u2588   \u2588 by bappi\x1B[0m
  \x1B[1m \u2588  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588   \u2588  https://abappi19.github.io/kitten-bot\x1B[0m
`;
async function install() {
  console.log(BANNER);
  console.log(`  Installing into: \x1B[36m${process.cwd()}\x1B[0m
`);
  console.log("  \x1B[1mA few things before we start:\x1B[0m\n");
  const config = {
    userName: await askName(),
    commLang: await askLanguage(),
    token: await askToken(),
    branch: await askBranch()
  };
  close();
  const ctx = {
    config,
    bundleDir: path2.join(__dirname, "..", "public"),
    skillDir: ".claude/skills/kitten-bot",
    draftDir: "_kitten-bot"
  };
  console.log("\n  \x1B[36m\u2192\x1B[0m Installing kitten-bot...\n");
  await runPipeline(steps, ctx);
  console.log("\n  \x1B[32m\x1B[1mkitten-bot installed.\x1B[0m\n");
  console.log("  Start a session: open Claude Code in this project and type /kitten-bot\n");
}
var [, , command] = process.argv;
if (command === "install") {
  install().catch((e) => {
    console.error("\n  \x1B[31mError:\x1B[0m", e.message, "\n");
    process.exit(1);
  });
} else {
  console.log("\n  Usage: npx kitten-bot install\n");
  process.exit(1);
}
