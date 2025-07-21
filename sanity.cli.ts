// sanity/sanity.cli.ts

import { defineCliConfig } from 'sanity/cli'
import { loadEnv } from 'vite'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

// --- THIS IS THE FIX ---
// This function tells the Sanity CLI to load the .env.local file from the root
// of your project and make those variables available to the Sanity Studio.
function getStudioEnvironmentVariables() {
  process.chdir('..'); // Go up one directory to the project root
  const env = loadEnv('development', process.cwd(), '');
  process.chdir('sanity'); // Go back into the sanity folder
  return env;
}
// --- END OF FIX ---

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset
  },
  // --- ADD THIS SECTION TO INJECT THE VARIABLES ---
  vite: (config) => {
    return {
      ...config,
      define: {
        ...config.define,
        'process.env': getStudioEnvironmentVariables(),
      },
    };
  },
});