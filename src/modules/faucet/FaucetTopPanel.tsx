import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { Link } from 'src/components/primitives/Link';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const FaucetTopPanel = () => {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const xsm = useMediaQuery(breakpoints.down('xsm'));
  const { currentMarketData } = useProtocolDataContext();
  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <Box>
          <PageTitle
            pageTitle={<Trans>{currentMarketData.marketTitle} Faucet</Trans>}
            withMarketSwitcher={true}
          />
          <Box sx={{ width: md ? (xsm ? '320px' : '540px') : '860px' }}>
            <Typography variant="description" color="#A5A8B6">
              <Trans>
                With testnet Faucet you can get free assets to test the Mooncake Finance Protocol. Make sure to
                switch your wallet provider to the appropriate testnet network, select desired
                asset, and click ‘Faucet’ to get tokens transferred to your wallet. The assets on a
                testnet are not “real,” meaning they have no monetary value.{' '}
                <Link
                  color="#A5A8B6"
                  href="https://docs.aave.com/developers/guides/testing-guide"
                  sx={{ textDecoration: 'underline' }}
                >
                  Learn more
                </Link>
              </Trans>
            </Typography>
          </Box>
        </Box>
      }
    />
  );
};
