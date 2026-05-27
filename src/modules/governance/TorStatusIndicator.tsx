import { Trans } from '@lingui/macro';
import { Box, Chip, Tooltip } from '@mui/material';
import { PrivacyPreference } from 'src/store/privacySlice';
import { useRootStore } from 'src/store/root';

export const TorStatusIndicator = () => {
  const preference = useRootStore((s) => s.privacyPreference);
  const setPrivacyPreference = useRootStore((s) => s.setPrivacyPreference);

  const toggle = () =>
    setPrivacyPreference(
      preference === PrivacyPreference.Tor ? PrivacyPreference.Clearnet : PrivacyPreference.Tor
    );

  const dotColor = preference === PrivacyPreference.Clearnet ? '#8E92A3' : '#46BC4B';

  const label = preference === PrivacyPreference.Clearnet ? 'Clearnet' : 'Tor';

  const tooltipText =
    preference === PrivacyPreference.Clearnet
      ? 'Queries use clearnet. Click to enable Tor routing.'
      : 'Queries routed through Tor. Click to switch to clearnet.';

  return (
    <Tooltip title={<Trans>{tooltipText}</Trans>} placement="bottom" arrow>
      <Chip
        onClick={toggle}
        size="small"
        icon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dotColor,
              ml: '6px !important',
              flexShrink: 0,
            }}
          />
        }
        label={label}
        sx={{
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
          color: '#8E92A3',
          fontSize: '0.7rem',
          height: 22,
          '&:hover': { borderColor: 'text.secondary' },
        }}
      />
    </Tooltip>
  );
};
