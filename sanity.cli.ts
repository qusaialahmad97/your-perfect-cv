// sanity/sanity.cli.ts

import { defineCliConfig } from 'sanity/cli'
import { loadEnv } from 'vite'
import type { UserConfig } from 'vite' // --- FIX 1: Import the UserConfig type from Vite ---

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

function getStudioEnvironmentVariables() {
  process.chdir('..');
  const env = loadEnv('development', process.cwd(), '');
  process.chdir('sanity');
  return env;
}

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset
  },
  vite: (config: UserConfig) => { // --- FIX 2: Explicitly type the 'config' parameter ---
    return {
      ...config,
      define: {
        ...config.define,
        'process.env': getStudioEnvironmentVariables(),
      },
    };
  },
});