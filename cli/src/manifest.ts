/**
 * Single source of truth for what gets bundled into public/
 * and installed into .claude/skills/kitten-bot/.
 *
 * Used by:
 *   - scripts/build.ts  (copy from skill source → public/)
 *   - steps/copy-files.ts (copy from public/ → target skill dir)
 */
export const manifest = {
  /** Whole directories — copied recursively */
  dirs: ['agents', 'rules', 'scripts'],
  /** Individual files at the skill root */
  files: ['SKILL.md', 'config.template.json'],
} as const;
