import type { Step, InstallContext } from './types.js';

const ok = (msg: string) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const fail = (msg: string) => console.error(`  \x1b[31m✗\x1b[0m ${msg}`);

export async function runPipeline(steps: Step[], ctx: InstallContext): Promise<void> {
  for (const step of steps) {
    try {
      await step.run(ctx);
      ok(step.label);
    } catch (e) {
      fail(step.label);
      throw e;
    }
  }
}
