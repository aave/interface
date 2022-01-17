// src/index.js
import React, { useEffect } from "react";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { en, es } from "make-plural/plurals";

i18n.loadLocaleData({
  en: { plurals: en },
  es: { plurals: es },
});

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LANGUAGES = ["en", "es"];
export const LANG_MAP = {
  en: "English",
  es: "Spanish",
};

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivateLanguage(locale: string) {
  console.log("prior");
  const { messages } = await import(`../translations/${locale}/messages`);
  console.log("heere");
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export const LanguageProvider: React.FunctionComponent = (props) => {
  useEffect(() => {
    // With this method we dynamically load the catalogs
    dynamicActivateLanguage(DEFAULT_LOCALE);
  }, []);

  return <I18nProvider i18n={i18n}>{props.children}</I18nProvider>;
};
