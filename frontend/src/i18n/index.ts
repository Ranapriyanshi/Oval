import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import enAU from './locales/en-AU.json';
import enUS from './locales/en-US.json';

// Get device locale
const deviceLocale = Localization.locale || 'en-AU';
const languageCode = deviceLocale.split('-')[0];
const regionCode = deviceLocale.split('-')[1];

// Determine initial language based on device locale
let initialLanguage = 'en-AU'; // Default to Australia
if (regionCode === 'US') {
  initialLanguage = 'en-US';
} else if (regionCode === 'AU' || !regionCode) {
  initialLanguage = 'en-AU';
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      'en-AU': {
        translation: enAU,
      },
      'en-US': {
        translation: enUS,
      },
    },
    lng: initialLanguage,
    fallbackLng: 'en-AU',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
