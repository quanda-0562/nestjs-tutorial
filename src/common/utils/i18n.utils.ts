import { getI18n } from '../../i18n/i18n.config';

/**
 * Translate a key using i18next
 * @param key - Translation key (e.g., 'auth.passwordTooShort')
 * @param options - Optional interpolation options
 * @returns Translated string
 */
export const t = (key: string, options?: Record<string, any>): string => {
  const i18n = getI18n();
  return i18n.t(key, options);
};
