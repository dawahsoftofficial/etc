import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-e2e/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "test-results/**",
      "playwright-report/**",
      // static sites and their tooling, not part of the Next.js app
      "mockup/**",
      "profile/**",
      "a4/**",
      "output/**",
      "tmp/**",
      "tests/mockup/**",
      "scripts/serve.mjs",
      "scripts/upload-to-spaces.mjs",
    ],
  },
  {
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "next/image", message: "Use @/components/ui/image (local files must skip the optimizer behind the preview gate)." }] }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  },
  { files: ["components/ui/image.tsx"], rules: { "no-restricted-imports": "off" } },
];

export default eslintConfig;
