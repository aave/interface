// src/index.js
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { en, es } from 'make-plural/plurals';
import React, { useEffect } from 'react';

import { messages } from '../locales/en';

i18n.loadLocaleData({
  en: { plurals: en },
  es: { plurals: es },
});
i18n.load('en', messages);
i18n.activate('en');

export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LANGUAGES = ['en', 'es'];
export const LANG_MAP = {
  en: 'English',
  es: 'Spanish',
};

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivateLanguage(locale: string) {
  const { messages } = await import(`../locales/${locale}`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  localStorage.setItem('LOCALE', locale);
}

export const LanguageProvider: React.FunctionComponent = (props) => {
  useEffect(() => {
    // With this method we dynamically load the catalogs
    const savedLocale = localStorage.getItem('LOCALE') || DEFAULT_LOCALE;
    if (i18n._locale !== savedLocale) dynamicActivateLanguage(savedLocale);
  }, []);

  return (
    <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
      {props.children}
    </I18nProvider>
  );
};
