import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const relativeParent = {
  group: ['../*'],
  message: 'Utiliser un alias (@game, @component…) plutôt que ../',
};
const folderTraversal = {
  regex: String.raw`^\./[^/]+/.+`,
  message: 'Importer le dossier (son index.ts), pas un fichier à l’intérieur.',
};
const uiLayers = ['@component/*', '@hook/*', '@context/*', '@page/*'];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  tseslint.configs.strict,
  unicorn.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'func-style': ['error', 'expression'],
      'unicorn/filename-case': [
        'error',
        { cases: { pascalCase: true, camelCase: true } },
      ],
      'unicorn/name-replacements': [
        'error',
        { allowList: { props: true, prop: true, ref: true } },
      ],
      'unicorn/no-null': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'no-restricted-imports': [
        'error',
        { patterns: [relativeParent, folderTraversal] },
      ],
    },
  },
  {
    files: ['src/game/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            relativeParent,
            folderTraversal,
            {
              group: [
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                'react-router',
                ...uiLayers,
              ],
              message:
                'src/game/ est du TypeScript pur : ni React ni couches UI.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['*.config.{js,ts}'],
    rules: { 'unicorn/prefer-module': 'off' },
  },
);
