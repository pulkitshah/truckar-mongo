import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  english: {
    translation: {}
  },
  hindi: {
    translation: {
      'Language changed': 'भाषा को सफलतापूर्वक बदल दिया',
      'Overview': 'सारांश',
      'Orders': 'सौदा',
      'Select your preferred language': 'अपनी पसंदीदा भाषा चुनें',
      'Settings':'सेटिंग्स',
      'Basic Details': 'बेसिक जानकारी',
      'Full Name': 'पूरा नाम',
      'Market Name': 'मार्केट में लोग आपको किस नाम से जाने हैं?',
      'Email Address':'ईमेल एड्रेस',
      'Mobile Number':'मोबाइल नंबर',

    }
  },
  
  
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'english',
    fallbackLng: 'english',
    interpolation: {
      escapeValue: false
    }
  });
