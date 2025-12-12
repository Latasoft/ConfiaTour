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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  },
  {
    rules: {
      // Convertir warnings de React Hooks a warnings (no errores)
      "react-hooks/exhaustive-deps": "warn",
      // Convertir warnings de imágenes a warnings (no errores)
      "@next/next/no-img-element": "warn",
      // Warnings de head element
      "@next/next/no-head-element": "warn",
    },
  },
];

export default eslintConfig;
