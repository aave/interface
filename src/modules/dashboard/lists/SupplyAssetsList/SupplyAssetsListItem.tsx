import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { NoData } from 'src/components/primitives/NoData';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../../../../components/lists/ListColumn';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemCanBeCollateral } from '../ListItemCanBeCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const SupplyAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  underlyingAsset,
  isActive,
  isFreezed,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  detailsAddress,
}: DashboardReserve) => {
  const { currentMarket } = useProtocolDataContext();
  const { openSupply } = useModalContext();

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage, debtCeiling } = useAssetCaps();
  const isMaxCapReached = supplyCapUsage.isMaxed;

  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={detailsAddress}
      data-cy={`dashboardSupplyListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={symbol}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
        withTooltip
        disabled={Number(walletBalance) === 0 || isMaxCapReached}
        capsComponent={
          <CapsHint
            capType={CapType.supplyCap}
            capAmount={supplyCap}
            totalAmount={totalLiquidity}
            withoutText
          />
        }
      />

      <ListAPRColumn value={Number(supplyAPY)} incentives={aIncentivesData} symbol={symbol} />

      <ListColumn>
        {debtCeiling.isMaxed ? (
          <NoData variant="main14" color="text.secondary" />
        ) : (
          <ListItemCanBeCollateral
            isIsolated={isIsolated}
            usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
          />
        )}
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive || isFreezed || Number(walletBalance) <= 0 || isMaxCapReached}
          variant="contained"
          onClick={() => {
            openSupply(underlyingAsset, currentMarket, name, 'dashboard');
          }}
        >
          <Trans>Supply</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
          onClick={() => {
            trackEvent(DASHBOARD.DETAILS_BUTTON_DASHBOARD, {
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
            });
          }}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
