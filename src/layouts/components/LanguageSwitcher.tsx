import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
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
    <Box
      component={component}
      onClick={onClick}
      sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}
    >
      <ListItemText>
        <Trans>Language</Trans>
      </ListItemText>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {i18n._(langMap[i18n.locale as keyof typeof langMap])}{' '}
        <SvgIcon fontSize="small" sx={{ color: { xs: '#F1F1F3', md: 'text.primary' }, ml: 1 }}>
          <ChevronRightIcon />
        </SvgIcon>
      </Box>
    </Box>
  );
};

export const LanguagesList = ({ component = ListItem, onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();

  return (
    <>
      <Box
        component={component}
        sx={{ color: { xs: '#F1F1F3', md: 'text.primary' }, mb: '4px' }}
        onClick={onClick}
      >
        <ListItemIcon
          sx={{
            minWidth: 'unset !important',
            mr: 2,
            color: { xs: '#F1F1F3', md: 'primary.light' },
          }}
        >
          <SvgIcon fontSize="small">
            <ChevronLeftIcon />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText disableTypography>
          <Typography variant="subheader2">
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
            color: { xs: '#F1F1F3', md: 'text.primary' },
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
              <SvgIcon fontSize="small" sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}>
                <CheckIcon />
              </SvgIcon>
            </ListItemIcon>
          )}
        </Box>
      ))}
    </>
  );
};
