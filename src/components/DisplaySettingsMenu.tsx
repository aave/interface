import { t, Trans } from '@lingui/macro';
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  FormControlLabel,
  Popover,
  Switch,
  Typography,
} from '@mui/material';
import { Fragment, ReactNode, useState } from 'react';
import { ManageIcon } from 'src/components/icons/ManageIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export interface DisplaySetting {
  key: string;
  label: ReactNode;
  ariaLabel: string;
  tooltip?: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
}

interface DisplaySettingsMenuProps {
  /** Each inner array is a section; sections are split by a divider. Empty sections are skipped. */
  sections: DisplaySetting[][];
  onReset: () => void;
  /** Disables Reset while every setting is already at its default. */
  isDefault: boolean;
}

// Panel geometry mirrors Aave Pro's Display dropdown.
const PANEL_INSET = '0.3125rem';
const ROW_INSET = '0.375rem';

/** Icon button opening a "Display" panel of switches, with a Reset on its heading. */
export const DisplaySettingsMenu = ({ sections, onReset, isDefault }: DisplaySettingsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const visibleSections = sections.filter((section) => section.length > 0);

  if (visibleSections.length === 0) return null;

  return (
    <>
      <Button
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={t`Display settings`}
        aria-haspopup="true"
        aria-expanded={open}
        sx={{
          width: '36px',
          px: 0,
          flexShrink: 0,
          color: open ? 'fg-1' : 'fg-3',
          '&:hover': { color: 'fg-1' },
        }}
      >
        <ManageIcon sx={{ fontSize: 20 }} />
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            variant: 'outlined',
            sx: {
              width: '16.625rem',
              mt: '8px',
              p: PANEL_INSET,
              borderRadius: '0.75rem',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            p: `${ROW_INSET} ${ROW_INSET} 0.25rem`,
            mb: PANEL_INSET,
            color: 'fg-4',
            fontSize: '0.6875rem',
            fontWeight: 600,
            lineHeight: 1.2,
            textTransform: 'uppercase',
          }}
        >
          <Trans>Display</Trans>
          <ButtonBase
            onClick={onReset}
            disabled={isDefault}
            sx={{
              font: 'inherit',
              textTransform: 'inherit',
              color: 'fg-2',
              '&:hover, &.Mui-focusVisible': { color: 'fg-1' },
              '&.Mui-disabled': { color: 'fg-4' },
            }}
          >
            <Trans>Reset</Trans>
          </ButtonBase>
        </Box>

        {visibleSections.map((section, index) => (
          <Fragment key={section[0].key}>
            {index > 0 && <Divider sx={{ my: PANEL_INSET }} />}
            {section.map((setting) => (
              <FormControlLabel
                key={setting.key}
                labelPlacement="start"
                control={
                  <Switch
                    checked={setting.checked}
                    onChange={(event) => setting.onChange(event.target.checked)}
                    inputProps={{ 'aria-label': setting.ariaLabel }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="buttonM" color="fg-1">
                      {setting.label}
                    </Typography>
                    {setting.tooltip && (
                      // Keeps the info icon's click from also toggling the switch via the label.
                      <Box onClick={(event) => event.preventDefault()}>
                        <TextWithTooltip iconMargin={2}>
                          <>{setting.tooltip}</>
                        </TextWithTooltip>
                      </Box>
                    )}
                  </Box>
                }
                sx={{
                  m: 0,
                  width: '100%',
                  justifyContent: 'space-between',
                  gap: 4,
                  p: '0.5rem',
                }}
              />
            ))}
          </Fragment>
        ))}
      </Popover>
    </>
  );
};
