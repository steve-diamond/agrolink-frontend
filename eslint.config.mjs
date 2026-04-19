import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "next.config.js",
  ]),
  {
    rules: {
      // Inline styles are used extensively in the admin dashboard — allow them.
      "@next/next/no-css-in-js": "off",
      // The current frontend uses broad any-typed API payloads across many screens.
      // Keep build-blocking lint off until those pages are fully typed.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
