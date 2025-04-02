import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript",
    {
      extends: ['next'],
      rules: {
        'react/no-unescaped-entities': 'off',
        '@next/next/no-page-custom-font': 'off',
        'react-hooks/rules-of-hooks': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/display-name': 'off',
      },
    }),

];

export default eslintConfig;
