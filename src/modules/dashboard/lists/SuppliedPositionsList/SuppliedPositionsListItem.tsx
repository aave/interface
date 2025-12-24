import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { isHorizonMarket } from 'src/components/transactions/Swap/constants/shared.constants';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { GENERAL } from 'src/utils/events';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { isIsolated, aIncentivesData, aTokenAddress, isFrozen, isActive, isPaused } = reserve;
  const { openSupply, openWithdraw, openCollateralChange, openCollateralSwap } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const [trackEvent, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData, store.currentMarket])
  );

  const isHorizon = isHorizonMarket(currentMarket);
  const collateralSwapEnabledForReserve = !isHorizon || reserve.borrowingEnabled;
  const showSwitchButton =
    isFeatureEnabled.liquiditySwap(currentMarketData) && collateralSwapEnabledForReserve;

  const canBeEnabledAsCollateral = user
    ? !debtCeiling.isMaxed &&
      reserve.reserveLiquidationThreshold !== '0' &&
      ((!reserve.isIsolated && !user.isInIsolationMode) ||
        user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
        (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'))
    : false;

  const disableSwap = !isActive || isPaused || reserve.symbol == 'stETH';
  const disableWithdraw = !isActive || isPaused;
  const disableSupply = !isActive || isFrozen || isPaused;

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={isPaused}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListValueColumn
        symbol={reserve.iconSymbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        market={currentMarket}
        protocolAction={ProtocolAction.supply}
        address={aTokenAddress}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => {
            openCollateralChange(
              underlyingAsset,
              currentMarket,
              reserve.name,
              'dashboard',
              usageAsCollateralEnabledOnUser
            );
          }}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => {
              // track

              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Swap Collateral',
                market: currentMarket,
                assetName: reserve.name,
                asset: underlyingAsset,
              });
              openCollateralSwap(underlyingAsset);
            }}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openSupply(underlyingAsset, currentMarket, reserve.name, 'dashboard')}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => {
            openWithdraw(underlyingAsset, currentMarket, reserve.name, 'dashboard');
          }}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
