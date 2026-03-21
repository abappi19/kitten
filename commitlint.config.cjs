/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope must be one of these when provided — optional but restricted
    'scope-enum': [
      2,
      'always',
      [
        // ── Modes ──────────────────────────────────────────────
        'normal-mode',       // changes that affect normal-mode behavior
        'contributor-mode',  // changes that affect contributor-mode behavior

        // ── Agents ─────────────────────────────────────────────
        'agents',            // generic multi-agent change
        'planner',
        'debugger',
        'committer',
        'code-reviewer',
        'rule-finder',
        'session-boot',
        'identity',
        'bmad-orchestrator',
        'project-bootstrap',
        'self-eval',
        'description-optimizer',

        // ── Reference libraries ─────────────────────────────────
        'refs',                    // generic reference change
        'react-best-practices',
        'react-native-skills',
        'composition-patterns',
        'bappi',                   // references/bappi/ profile files
        'kitten',                  // references/kitten/ persona files

        // ── Skill infrastructure ────────────────────────────────
        'rules',     // CRITICAL.md / MAP.md
        'scripts',   // k_load.py and other scripts
        'config',    // config.json / config.template.json
        'bmad',      // _bmad/ installation and orchestration

        // ── Project tooling ─────────────────────────────────────
        'evals',     // evals.json and eval runner
        'docs',
        'ci',
      ],
    ],

    // Scope must be kebab-case when provided
    'scope-case': [2, 'always', 'kebab-case'],

    // Allow empty scope — scope is optional
    'scope-empty': [0, 'never'],

    // Subject line: sentence case allowed (Bappi's style in git log)
    'subject-case': [0],

    // Body: no hard line length limit for long descriptions
    'body-max-line-length': [1, 'always', 200],
  },
}
