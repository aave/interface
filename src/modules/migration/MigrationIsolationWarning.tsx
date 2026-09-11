import { Trans } from '@lingui/macro';
import { Alert, Box } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { IsolatedReserve } from 'src/store/v3MigrationSelectors';
import { useShallow } from 'zustand/shallow';

export const MigrationIsolationWarning = ({
  isolatedReserveV3,
}: {
  isolatedReserveV3?: IsolatedReserve;
}) => {
  const [currentMarket, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentMarket, store.currentMarketData])
  );

  if (!isolatedReserveV3 || isolatedReserveV3.enteringIsolationMode) return null;

  const marketName = currentMarketData.marketTitle;
  const marketLink = ROUTES.dashboard + '/?marketName=' + currentMarket + '_v3';

  return (
    <Box sx={{ pt: 4 }}>
      <Alert severity="warning" data-size="small" sx={{ width: '100%', mb: 0 }}>
        <Trans>
          Some migrated assets will not be used as collateral due to enabled isolation mode in{' '}
          {marketName} V3 Market. Visit <Link href={marketLink}>{marketName} V3 Dashboard</Link> to
          manage isolation mode.
        </Trans>
      </Alert>
    </Box>
  );
};
