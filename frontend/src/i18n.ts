import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../en.json';
import fi from '../fi.json';
import ru from '../ru.json';
import sr from '../sr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      english: { translation: en },
      finnish: { translation: fi },
      russian: { translation: ru },
      serbian: { translation: sr },
    },
    lng: localStorage.getItem('language') || 'english', // Default
    fallbackLng: 'english',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;