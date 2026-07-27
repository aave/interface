import { CheckIcon } from '@heroicons/react/solid';
import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import {
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import React from 'react';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';

import { dynamicActivateLanguage } from '../../libs/LanguageProvider';

const langMap = {
  en: t`English`,
  es: t`Spanish`,
  fr: t`French`,
  el: t`Greek`,
};

interface LanguageListItemProps {
  component?: typeof MenuItem | typeof ListItem;
  onClick: () => void;
}

export const LanguageListItem = ({ component = ListItem, onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();

  return (
    <Box component={component} onClick={onClick} sx={{ color: 'fg-1' }}>
      <ListItemText>
        <Trans>Language</Trans>
      </ListItemText>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'fg-3' }}>
        <ListItemText>{i18n._(langMap[i18n.locale as keyof typeof langMap])}</ListItemText>
        <ChevronRightIcon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );
};

export const LanguagesList = ({ component = ListItem, onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();

  return (
    <>
      <Box component={component} sx={{ color: 'fg-1', mb: '4px' }} onClick={onClick}>
        <ListItemIcon sx={{ minWidth: 'unset !important', mr: 2, color: 'fg-1' }}>
          <ChevronRightIcon sx={{ fontSize: 24, transform: 'rotate(180deg)' }} />
        </ListItemIcon>
        <ListItemText disableTypography>
          <Typography variant="h3">
            <Trans>Select language</Trans>
          </Typography>
        </ListItemText>
      </Box>

      {Object.keys(langMap).map((lang) => (
        <Box
          component={component}
          key={lang}
          onClick={() => dynamicActivateLanguage(lang)}
          sx={{
            color: 'fg-1',
            '.MuiListItemIcon-root': { minWidth: 'unset' },
            '.MuiMenuItemIcon-root': { minWidth: 'unset' },
          }}
        >
          <ListItemIcon
            sx={{ mr: 3, borderRadius: '2px', overflow: 'hidden', width: 20, height: 14 }}
          >
            <img src={`/icons/flags/${lang}.svg`} width="100%" height="100%" alt={`${lang} icon`} />
          </ListItemIcon>
          <ListItemText>{i18n._(langMap[lang as keyof typeof langMap])}</ListItemText>
          {lang === i18n.locale && (
            <ListItemIcon sx={{ m: 0 }}>
              <SvgIcon fontSize="small" sx={{ color: 'fg-1' }}>
                <CheckIcon />
              </SvgIcon>
            </ListItemIcon>
          )}
        </Box>
      ))}
    </>
  );
};
