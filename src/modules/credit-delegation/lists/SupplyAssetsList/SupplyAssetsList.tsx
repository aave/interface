import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from '../../../../hooks/app-data-provider/useWalletBalances';
import { ListLoader } from '../ListLoader';

const head = [
  { title: <Trans key="assets">Assets</Trans>, sortKey: 'symbol' },
  { title: <Trans key="Wallet balance">Wallet balance</Trans>, sortKey: 'walletBalance' },
  { title: <Trans key="APY">APY</Trans>, sortKey: 'supplyAPY' },
  {
    title: <Trans key="Can be collateral">Can be collateral</Trans>,
    sortKey: 'usageAsCollateralEnabledOnUser',
  },
];

export const SupplyAssetsList = () => {
  const { loading: loadingReserves } = useAppDataContext();
  const { loading } = useWalletBalances();

  const tokensToSupply: unknown[] = [];

  if (loadingReserves || loading)
    return (
      <ListLoader
        head={head.map((col) => col.title)}
        title={<Trans>Assets to supply</Trans>}
        withTopMargin
      />
    );

  const supplyDisabled = !tokensToSupply.length;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Assets to supply</Trans>
        </Typography>
      }
      localStorageName="supplyAssetsCreditDelegationTableCollapse"
      withTopMargin
      noData={supplyDisabled}
    >
      {' '}
    </ListWrapper>
  );
};
