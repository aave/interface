import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { dynamicActivateLanguage } from "../../libs/LanguageProvider";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export const LanguageSelector = (props) => {
  const { i18n } = useLingui();

  const onLangChange = (event: SelectChangeEvent<string>) => {
    const locale = event.target.value;
    if (locale) {
      dynamicActivateLanguage(locale);
    } else {
      console.error("[LanguageSelector] Missing locale");
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
