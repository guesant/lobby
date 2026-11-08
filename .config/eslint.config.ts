import { blockDirectiveNewline } from './eslint-rules/block-directive-newline.ts';
import { multilineStructures } from './eslint-rules/layout.ts';
import noNarrativeComments from './eslint-rules/no-narrative-comments.ts';
import noNestedCallArguments from './eslint-rules/no-nested-call-arguments.ts';
import oneFunctionPerFile from './eslint-rules/one-function-per-file.ts';
import statementSpacing from './eslint-rules/statement-spacing.ts';
import typesOnly from './eslint-rules/types-only.ts';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import { importX } from 'eslint-plugin-import-x';
import importSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

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
  ...tseslint.configs.strictTypeChecked.map(
    (
      configuration,
    ): typeof configuration & {
      files: string[];
    } => {
      return {
        ...configuration,
        files: [
          '**/*.{ts,mts,cts,svelte}',
        ],
      };
    },
  ),
  ...tseslint.configs.stylisticTypeChecked.map(
    (
      configuration,
    ): typeof configuration & {
      files: string[];
    } => {
      return {
        ...configuration,
        files: [
          '**/*.{ts,mts,cts,svelte}',
        ],
      };
    },
  ),
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
      'simple-import-sort': importSort,
      'import-x': importX,
      '@stylistic': stylistic,
      lobby: {
        rules: {
          ...statementSpacing.rules,
          'no-narrative-comments': noNarrativeComments,
          ...noNestedCallArguments.rules,
          ...oneFunctionPerFile.rules,
          'types-only': typesOnly,
          'multiline-structures': multilineStructures,
          'block-directive-newline': blockDirectiveNewline,
        },
      },
    },
    rules: {
      'lobby/no-narrative-comments': 'error',
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
        {
          blankLine: 'never',
          prev: {
            selector:
              ':matches(ExportNamedDeclaration[source!=null], ExportAllDeclaration)',
          },
          next: {
            selector:
              ':matches(ExportNamedDeclaration[source!=null], ExportAllDeclaration)',
          },
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
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [
              '^',
            ],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: false,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: ':function > :matches(ObjectPattern, ArrayPattern).params',
          message:
            'Keep a named input parameter and destructure it inside the function.',
        },
        {
          selector:
            ':function > AssignmentPattern.params > :matches(ObjectPattern, ArrayPattern).left',
          message:
            'Keep a named input parameter and destructure it inside the function.',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      complexity: [
        'error',
        8,
      ],
      'max-depth': [
        'error',
        3,
      ],
      'max-lines': [
        'error',
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'sonarjs/cognitive-complexity': [
        'error',
        10,
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-statements': [
        'error',
        15,
      ],
      'max-params': [
        'error',
        3,
      ],
      'max-nested-callbacks': [
        'error',
        2,
      ],
      'svelte/no-navigation-without-resolve': 'error',
      'svelte/require-each-key': 'error',
    },
  },
  {
    files: [
      'website/src/**/*.{js,mjs,cjs,ts,mts,cts,svelte}',
      '.config/scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
    ],
    ignores: [
      '**/*.test.*',
      '**/fixtures/**',
      '.config/scripts/accessibility-*.ts',
      '.config/scripts/browser-*.ts',
      '.config/scripts/check-*.ts',
      '.config/scripts/layout-*.ts',
    ],
    rules: {
      'lobby/one-function-per-file': 'error',
      'lobby/one-class-per-file': 'error',
      'lobby/no-nested-call-arguments': 'error',
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],
    },
  },
  {
    files: [
      'website/src/**/*.{ts,mts,cts,svelte}',
      '.config/scripts/**/*.{ts,mts,cts}',
    ],
    ignores: [
      '**/*.test.*',
      '**/fixtures/**',
    ],
    rules: {
      'lobby/types-only': 'error',
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
      'lobby/block-directive-newline': 'error',
      'lobby/svelte-top-level-spacing': 'error',
      'lobby/svelte-import-first': 'error',
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
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'type',
      ],
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
          'ts-expect-error': 'allow-with-description',
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
      'max-lines': 'off',
      'svelte/max-lines-per-block': [
        'error',
        {
          script: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'svelte/indent': [
        'error',
        {
          indent: 2,
          indentScript: true,
          switchCase: 1,
          alignAttributesVertically: false,
        },
      ],
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
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: [
      '.config/**/*.config.{ts,js}',
      '.config/eslint.config.ts',
      '**/*.d.ts',
      '**/*.types.ts',
    ],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    files: [
      '.config/scripts/*.test.ts',
      '.config/scripts/check-*-browser.ts',
      '.config/scripts/check-layout.ts',
      '.config/scripts/check-language-continuity.ts',
      '.config/scripts/check-language-spa.ts',
      '.config/scripts/check-compact-controls.ts',
      '.config/scripts/check-component-parity.ts',
      '.config/scripts/check-progressive-scene.ts',
      '.config/scripts/layout-*.ts',
    ],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
    },
  },
  {
    files: [
      'website/src/lib/features/**/*.model.ts',
      'website/src/lib/features/**/*.validation.ts',
      'website/src/lib/features/**/*.viewmodel.ts',
      'website/src/lib/features/**/*.viewmodel.svelte.ts',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'localStorage',
        'sessionStorage',
        'HTMLElement',
        'HTMLDialogElement',
        'matchMedia',
      ],
    },
  },
  {
    files: [
      'website/src/**/*.svelte',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        'fetch',
        'localStorage',
        'sessionStorage',
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message: 'Use the preference controller or a browser adapter.',
        },
        {
          object: 'window',
          property: 'sessionStorage',
          message: 'Use the preference controller or a browser adapter.',
        },
      ],
    },
  },
  {
    files: [
      '**/*.d.ts',
    ],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    files: [
      'website/src/lib/features/metadata/JsonLd.svelte',
    ],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
];
