import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import trJSON from './tr.json';
import enJSON from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enJSON },
      tr: { translation: trJSON }
    },
    lng: 'en',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;