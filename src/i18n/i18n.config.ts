import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

export const initI18n = async () => {
  // Xác định đường dẫn locale files
  const isProduction = process.env.NODE_ENV === 'production';
  const localesPath = isProduction
    ? path.join(process.cwd(), 'dist/i18n/locales/{{lng}}.json')
    : path.join(process.cwd(), 'src/i18n/locales/{{lng}}.json');

  await i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
      fallbackLng: 'en',
      preload: ['en', 'vi'],
      backend: {
        loadPath: localesPath,
      },
      detection: {
        order: ['header', 'query', 'cookie'],
        caches: ['cookie'],
        lookupHeader: 'language',
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
};

export const getI18n = () => i18next;
