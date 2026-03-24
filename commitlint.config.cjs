/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope must be one of these when provided — optional but restricted
    'scope-enum': [
      2,
      'always',
      [
        'normal-mode',      // changes that affect normal-mode behavior
        'contributor-mode', // changes that affect contributor-mode behavior
        'agents',           // any agent file change
        'refs',             // any reference library change
        'rules',            // CRITICAL.md / MAP.md
        'evals',            // evals.json and eval runner
        'scripts',          // k_load.py and other scripts
        'config',           // config.json / config.template.json
        'ci',               // commitlint, husky, tooling
        'cli',              // npx installer package
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
