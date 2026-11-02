import { runCommand } from './process.ts';

const commands: [
  string,
  string[],
][] = [
  [
    'node',
    [
      '.config/scripts/check-comment-policy.ts',
    ],
  ],
  [
    'pnpm',
    [
      '--dir',
      '.config',
      'run',
      'comments:test',
    ],
  ],
  [
    'pnpm',
    [
      '--dir',
      '.config',
      'run',
      'comments:scan',
    ],
  ],
  [
    'yamllint',
    [
      '-c',
      '.config/yamllint.yml',
      '.config',
      '.github',
      'website/src/data',
    ],
  ],
  [
    'pnpm',
    [
      '--dir',
      '.config',
      'run',
      'markdown',
    ],
  ],
  [
    'hadolint',
    [
      '--config',
      '.config/hadolint.yaml',
      '.config/container/Dockerfile',
    ],
  ],
];

for (const [
  name,
  args,
] of commands) {
  await runCommand(name, args);
}
