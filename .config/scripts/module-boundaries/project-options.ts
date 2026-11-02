import { resolve } from 'node:path';
import ts from 'typescript';

export function projectOptions(): ts.CompilerOptions {
  const readFile = ts.sys.readFile.bind(ts.sys);

  const configurationPath = resolve('website/tsconfig.json');

  const configuration = ts.readConfigFile(configurationPath, readFile);

  if (configuration.error) {
    throw new Error('Cannot read website TypeScript configuration');
  }

  const value: unknown = configuration.config;

  if (!value || typeof value !== 'object') {
    throw new Error('Invalid TypeScript configuration');
  }

  const projectRoot = resolve('website');

  return ts.parseJsonConfigFileContent(value, ts.sys, projectRoot).options;
}
