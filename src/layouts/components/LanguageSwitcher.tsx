import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Box, ListItem, ListItemIcon, ListItemText, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import { dynamicActivateLanguage } from '../../libs/LanguageProvider';

const langMap = {
  en: t`English`,
  es: t`Spanish`,
};

interface LanguageListItemProps {
  onClick: () => void;
}

export const LanguageListItem = ({ onClick }: LanguageListItemProps) => {
  const { i18n } = useLingui();
  return (
    <ListItem onClick={onClick} sx={{ color: { xxs: 'common.white', md: 'text.primary' } }}>
      <ListItemText>
        <Trans>Language</Trans>
      </ListItemText>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {i18n._(langMap[i18n.locale as keyof typeof langMap])}{' '}
        <SvgIcon
          fontSize="small"
          sx={{ color: { xxs: 'common.white', md: 'text.primary' }, ml: 1 }}
        >
          <ChevronRightIcon />
        </SvgIcon>
      </Box>
    </ListItem>
  );
};

interface LanguagesListProps {
  onClick: () => void;
}

export const LanguagesList = ({ onClick }: LanguagesListProps) => {
  const { i18n } = useLingui();

  return (
    <>
      <ListItem sx={{ color: { xxs: 'common.white', md: 'text.primary' } }} onClick={onClick}>
        <ListItemIcon
          sx={{
            minWidth: 'unset !important',
            mr: 2,
            color: { xxs: 'common.white', md: 'primary.light' },
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
      </ListItem>

      {Object.keys(langMap).map((lang) => (
        <ListItem
          key={lang}
          onClick={() => dynamicActivateLanguage(lang)}
          sx={{
            color: { xxs: 'common.white', md: 'text.primary' },
            '.MuiListItemIcon-root': { minWidth: 'unset' },
          }}
        >
          <ListItemIcon
            sx={{ mr: 3, borderRadius: '2px', overflow: 'hidden', width: 20, height: 14 }}
          >
            <img src={`/icons/flags/${lang}.svg`} width="100%" height="100%" alt={`${lang} icon`} />
          </ListItemIcon>
          <ListItemText>{i18n._(langMap[lang as keyof typeof langMap])}</ListItemText>
          {lang === i18n.locale && (
            <ListItemIcon>
              <SvgIcon fontSize="small" sx={{ color: { xxs: 'common.white', md: 'text.primary' } }}>
                <CheckIcon />
              </SvgIcon>
            </ListItemIcon>
          )}
        </ListItem>
      ))}
    </>
  );
};
