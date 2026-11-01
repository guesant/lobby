import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import noNarrativeComments from './eslint-rules/no-narrative-comments.ts';
import statementSpacing from './eslint-rules/statement-spacing.ts';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import { multilineStructures } from './eslint-rules/layout.ts';

const separatedStatements = [
  'const',
  'let',
  'var',
  'function',
  'class',
  'type',
  'interface',
  'enum',
  'if',
  'switch',
  'for',
  'while',
  'do',
  'try',
  'export',
  'cjs-export',
  'block',
  'iife',
];

export default [
  {
    ignores: [
      '.cache/**',
      'website/.svelte-kit/**',
      '.local/**',
      'website/node_modules/**',
      '.config/node_modules/**',
      '.config/audit/node_modules/**',
      '.config/python/**',
      '.pnpm-store/**',
      'website/static/assets/**',
    ],
  },
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: [
      '**/*.{js,mjs,cjs,ts,mts,cts,svelte}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      sonarjs,
      '@stylistic': stylistic,
      lobby: {
        rules: {
          ...statementSpacing.rules,
          'no-narrative-comments': noNarrativeComments,
          'multiline-structures': multilineStructures,
        },
      },
    },
    rules: {
      '@stylistic/indent': [
        'error',
        2,
      ],
      '@stylistic/newline-per-chained-call': [
        'error',
        {
          ignoreChainWithDepth: 1,
        },
      ],
      'lobby/multiline-structures': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: separatedStatements,
        },
        {
          blankLine: 'always',
          prev: separatedStatements,
          next: '*',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'return',
            'throw',
          ],
        },
        {
          blankLine: 'always',
          prev: {
            selector: 'SwitchCase[consequent.length>0]',
          },
          next: [
            'case',
            'default',
          ],
        },
        {
          blankLine: 'never',
          prev: {
            selector: 'SwitchCase[consequent.length=0]',
          },
          next: [
            'case',
            'default',
          ],
        },
        {
          blankLine: 'always',
          prev: [
            'import',
            'cjs-import',
          ],
          next: '*',
        },
        {
          blankLine: 'never',
          prev: [
            'import',
            'cjs-import',
          ],
          next: [
            'import',
            'cjs-import',
          ],
        },
      ],
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            minProperties: 1,
          },
          ObjectPattern: {
            minProperties: 1,
          },
          ImportDeclaration: {
            multiline: true,
            consistent: true,
          },
          ExportDeclaration: {
            multiline: true,
            consistent: true,
          },
        },
      ],
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],
      '@stylistic/padded-blocks': [
        'error',
        'never',
      ],
      curly: [
        'error',
        'all',
      ],
      'arrow-body-style': [
        'error',
        'always',
      ],
      'no-ternary': 'error',
      'no-empty': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      complexity: [
        'error',
        15,
      ],
      'max-depth': [
        'error',
        4,
      ],
      'max-lines': [
        'error',
        {
          max: 600,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'sonarjs/cognitive-complexity': [
        'error',
        15,
      ],
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/require-each-key': 'off',
    },
  },
  {
    files: [
      '**/*.{ts,mts,cts,svelte}',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
        extraFileExtensions: [
          '.svelte',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      'lobby/no-narrative-comments': 'error',
      'lobby/svelte-top-level-spacing': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreVoid: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-undef': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false,
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': true,
        },
      ],
    },
  },
  {
    files: [
      '**/*.svelte',
    ],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: typescriptParser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@stylistic/indent': 'off',
      'svelte/indent': [
        'error',
        {
          indent: 2,
          indentScript: true,
          switchCase: 1,
          alignAttributesVertically: false,
        },
      ],
      'lobby/no-narrative-comments': 'error',
    },
  },
  {
    files: [
      '.config/scripts/**/*.{mts,cts,ts}',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 800,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: [
      'website/src/lib/SitePage.svelte',
    ],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
];
