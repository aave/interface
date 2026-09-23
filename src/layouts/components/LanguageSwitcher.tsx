import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { ListItem, MenuItem } from '@mui/material';
import React from 'react';

import { dynamicActivateLanguage } from '../../libs/LanguageProvider';
import { SettingsNavRow } from './SettingsNavRow';
import { SettingsSubmenuList } from './SettingsSubmenuList';

const langMap = {
  en: t`English`,
  es: t`Spanish`,
  fr: t`French`,
  el: t`Greek`,
};

// The flags are static artwork, so the elements are built once. Their box is sized by the icon
// slot — 20x14 in the menu, scaled up by the drawer's own row rules (see MobileMenu's menuListSx).
const FLAG_OPTIONS = Object.keys(langMap).map((lang) => ({
  key: lang,
  icon: <img src={`/icons/flags/${lang}.svg`} width="100%" height="100%" alt={`${lang} icon`} />,
}));

interface LanguageListItemProps {
  component?: typeof MenuItem | typeof ListItem;
  onClick: () => void;
}

export const LanguageListItem = ({ component = ListItem, onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();

  return (
    <SettingsNavRow
      component={component}
      label={<Trans>Language</Trans>}
      value={i18n._(langMap[i18n.locale as keyof typeof langMap])}
      onClick={onClick}
    />
  );
};

export const LanguagesList = ({ component = ListItem, onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();

  return (
    <SettingsSubmenuList
      component={component}
      selectedKey={i18n.locale}
      onBack={onClick}
      onSelect={dynamicActivateLanguage}
      options={FLAG_OPTIONS.map((option) => ({
        ...option,
        label: i18n._(langMap[option.key as keyof typeof langMap]),
      }))}
    />
  );
};
