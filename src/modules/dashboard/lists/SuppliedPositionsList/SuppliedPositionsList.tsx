import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment } from 'react';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { CollateralSwitchTooltip } from '../../../../components/infoTooltips/CollateralSwitchTooltip';
import { CollateralTooltip } from '../../../../components/infoTooltips/CollateralTooltip';
import { TotalSupplyAPYTooltip } from '../../../../components/infoTooltips/TotalSupplyAPYTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useHelpContext } from '../../../../hooks/useHelp';
import { ListTopInfoItem } from '../../../dashboard/lists/ListTopInfoItem';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { ListHeader } from '../ListHeader';
import { ListLoader } from '../ListLoader';
import { SuppliedPositionsListItem } from './SuppliedPositionsListItem';
import { SuppliedPositionsListMobileItem } from './SuppliedPositionsListMobileItem';
import { HelpModal } from 'src/components/helpTours/HelpModal';
import { ConfirmationHelpModal } from 'src/components/helpTours/ConfirmationHelpModal';

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { setWitdrawTourActive } = useHelpContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const suppliedPosition =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== '0')
      .map((userReserve) => ({
        ...userReserve,
        reserve: {
          ...userReserve.reserve,
          ...(userReserve.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: currentNetworkConfig.baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        },
      })) || [];

  setWitdrawTourActive(suppliedPosition.length);

  const head = [
    <Trans key="Balance">Balance</Trans>,
    <Trans key="APY">APY</Trans>,
    <CollateralSwitchTooltip
      text={<Trans>Collateral</Trans>}
      key="Collateral"
      variant="subheader2"
    />,
  ];

  if (loading) return <ListLoader title={<Trans>Your supplies</Trans>} head={head} />;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Your supplies</Trans>
        </Typography>
      }
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!suppliedPosition.length}
      topInfo={
        <>
          {!!suppliedPosition.length && (
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
              <ListTopInfoItem
                title={<Trans>Collateral</Trans>}
                value={user?.totalCollateralUSD || 0}
                tooltip={<CollateralTooltip />}
              />
            </>
          )}
        </>
      }
    >
      {suppliedPosition.length ? (
        <>
          <HelpModal />
          <ConfirmationHelpModal />
          {!downToXSM && <ListHeader head={head} />}
          {suppliedPosition.map((item, index) => (
            <Fragment key={item.underlyingAsset}>
              <AssetCapsProvider asset={item.reserve}>
                {downToXSM ? (
                  <SuppliedPositionsListMobileItem {...item} user={user} index={index} />
                ) : (
                  <SuppliedPositionsListItem {...item} user={user} index={index} />
                )}
              </AssetCapsProvider>
            </Fragment>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
      )}
    </ListWrapper>
  );
};
