import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { useRootStore } from 'src/store/root';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const FaucetTopPanel = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <>
          <PageTitle
            pageTitle={<Trans>{currentMarketData.marketTitle} Faucet</Trans>}
            withMarketSwitcher={true}
          />
          <Typography variant="description" sx={{ color: 'fg-3', maxWidth: '824px' }}>
            <Trans>
              With testnet Faucet you can get free assets to test the Aave Protocol. Make sure to
              switch your wallet provider to the appropriate testnet network, select desired asset,
              and click ‘Faucet’ to get tokens transferred to your wallet. The assets on a testnet
              are not “real,” meaning they have no monetary value.{' '}
              <Link
                href="https://docs.aave.com/developers/guides/testing-guide"
                sx={{ textDecoration: 'underline', color: 'fg-3' }}
              >
                Learn more
              </Link>
            </Trans>
          </Typography>
        </>
      }
    />
  );
};
