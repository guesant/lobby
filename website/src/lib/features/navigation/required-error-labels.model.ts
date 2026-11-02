import { requiredErrorLabel } from './required-error-label.model.ts';

export type RequiredLabels = {
  not_found_title: string;
  not_found_description: string;
  not_found_home: string;
  not_found_languages: string;
  error_title: string;
  error_description: string;
};

export function requiredErrorLabels(
  ui: Record<string, string>,
  locale: string,
): RequiredLabels {
  return {
    not_found_title: requiredErrorLabel(ui, 'not_found_title', locale),
    not_found_description: requiredErrorLabel(
      ui,
      'not_found_description',
      locale,
    ),
    not_found_home: requiredErrorLabel(ui, 'not_found_home', locale),
    not_found_languages: requiredErrorLabel(ui, 'not_found_languages', locale),
    error_title: requiredErrorLabel(ui, 'error_title', locale),
    error_description: requiredErrorLabel(ui, 'error_description', locale),
  };
}
