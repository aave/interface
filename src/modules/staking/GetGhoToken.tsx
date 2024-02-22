import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

export const GetGhoToken = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleClick = () => {
    trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'Get Gho' });
  };

  return (
    <>
      <DarkTooltip title="Get GHO to stake within the Aave Protocol">
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          data-cy={`getGho-token`} // todo tests
          startIcon={
            <Box sx={{ mr: -1 }}>
              <TokenIcon symbol="GHO" sx={{ fontSize: '14px' }} />
            </Box>
          }
        >
          <Trans>Get GHO</Trans>
        </Button>
      </DarkTooltip>
    </>
  );
};
