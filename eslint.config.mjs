import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    // Add a new configuration object for custom rules
    rules: {
      "react/no-unescaped-entities": "off", // Disable the rule
      // Or set it to 'warn' if you prefer warnings over errors during build
      // "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;