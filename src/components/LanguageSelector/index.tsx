import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import LanguageIcon from '@mui/icons-material/Language';
import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React from 'react';

import { dynamicActivateLanguage } from '../../libs/LanguageProvider';

export const LanguageSelector = (props: FormControlProps) => {
  const { i18n } = useLingui();

  const onLangChange = (event: SelectChangeEvent<string>) => {
    const locale = event.target.value;
    if (locale) {
      dynamicActivateLanguage(locale);
    } else {
      console.error('[LanguageSelector] Missing locale');
    }
  };

  return (
    <FormControl sx={{ width: 140 }} {...props}>
      <InputLabel id="language-selector">Language</InputLabel>
      <Select
        label="Language"
        startAdornment={<LanguageIcon sx={{ mr: 1 }} />}
        defaultValue={i18n.locale}
        onChange={onLangChange}
      >
        <MenuItem value="en">
          <Trans>English</Trans>
        </MenuItem>
        <MenuItem value="es">
          <Trans>Spanish</Trans>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
