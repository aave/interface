import { Trans } from '@lingui/macro';
import { Alert, Box, Link } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

export const ParameterChangewarning = ({ underlyingAsset }: { underlyingAsset: string }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Alert severity="info" data-size="small" sx={{ width: '100%', my: 6 }}>
      <Trans>
        <Box component="span" sx={{ fontWeight: 500 }}>
          Attention:
        </Box>{' '}
        Parameter changes via governance can alter your account health factor and risk of
        liquidation. Follow the{' '}
        <Link
          onClick={() => {
            trackEvent(GENERAL.EXTERNAL_LINK, {
              asset: underlyingAsset,
              Link: 'Governance Link',
            });
          }}
          href="https://governance.aave.com/"
          target="_blank"
          rel="noopener"
        >
          Aave governance forum
        </Link>{' '}
        for updates.
      </Trans>
    </Alert>
  );
};
