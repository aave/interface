import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { TotalSupplyAPYTooltip } from 'src/components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { CreditDelegationContentNoData } from '../../CreditDelegationContentNoData';
import { ListLoader } from '../ListLoader';
import { ListTopInfoItem } from '../ListTopInfoItem';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <Trans key="Balance">Balance</Trans>,
    sortKey: 'underlyingBalance',
  },

  {
    title: <Trans key="APY">APY</Trans>,
    sortKey: 'supplyAPY',
  },
];

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();

  const data: unknown[] = [];

  if (loading)
    return <ListLoader title={<Trans>Your supplies</Trans>} head={head.map((col) => col.title)} />;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your supplies</Trans>
        </Typography>
      }
      localStorageName="suppliedAssetsCreditDelegationTableCollapse"
      noData={!data}
      topInfo={
        <>
          {!data && (
            <>
              <ListTopInfoItem
                title={<Trans>Balance</Trans>}
                value={user?.totalLiquidityUSD || 0}
              />
              <ListTopInfoItem
                title={<Trans>APY</Trans>}
                value={user?.earnedAPY || 0}
                percent
                tooltip={<TotalSupplyAPYTooltip />}
              />
            </>
          )}
        </>
      }
    >
      {!data.length && <CreditDelegationContentNoData text={<Trans>Nothing supplied yet</Trans>} />}
    </ListWrapper>
  );
};
