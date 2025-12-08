import { API_ETH_MOCK_ADDRESS, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
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
  usageAsCollateralEnabledOnUser,
  symbol,
  name,
  iconSymbol,
}: DashboardReserve) => {
  const { isFrozen, isPaused } = reserve;
  const { openSupply, openWithdraw, openCollateralChange, openCollateralSwap } = useModalContext();
  const [trackEvent, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData, store.currentMarket])
  );
  // Get legacy reserve data to support Supply, withdraw, swaps modal actions
  const { reserves: reservesLegacy } = useAppDataContext();
  const reserveItemLegacy = reservesLegacy.find(
    (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingToken.address.toLowerCase()
  );
  const legacyAsset = reserve.acceptsNative
    ? API_ETH_MOCK_ADDRESS.toLowerCase()
    : reserveItemLegacy?.underlyingAsset.toLowerCase() ||
      reserve.underlyingToken.address.toLowerCase();

  const legacyName = reserveItemLegacy?.name || reserve.underlyingToken.name;

  const showSwitchButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  const canBeEnabledAsCollateral = reserve.usageAsCollateralEnabledOnUser;

  const disableSwap = isPaused || reserve.underlyingToken.symbol == 'stETH';
  const disableWithdraw = isPaused;
  const disableSupply = isFrozen || isPaused;

  const { iconSymbol: iconSymbolFetched } = fetchIconSymbolAndName({
    underlyingAsset: reserve.underlyingToken.address,
    symbol: reserve.underlyingToken.symbol,
    name: reserve.underlyingToken.name,
  });

  const displayIconSymbol =
    iconSymbolFetched?.toLowerCase() !== reserve.underlyingToken.symbol.toLowerCase()
      ? iconSymbolFetched
      : reserve.underlyingToken.symbol;
  const supplyProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'supply');

  return (
    <ListItemWrapper
      symbol={symbol || reserve.underlyingToken.symbol}
      iconSymbol={iconSymbol || displayIconSymbol}
      name={name || reserve.underlyingToken.name}
      detailsAddress={reserve.underlyingToken.address.toLowerCase()}
      currentMarket={currentMarket}
      frozen={isFrozen}
      paused={isPaused}
      data-cy={`dashboardSuppliedListItem_${reserve.underlyingToken.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.underlyingToken.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListValueColumn
        symbol={reserve.underlyingToken.symbol}
        value={Number(reserve.balancePosition?.amount.value ?? 0)}
        subValue={Number(reserve.balancePosition?.usd ?? 0)}
        disabled={Number(reserve.balancePosition?.amount.value ?? 0) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyInfo.apy.value ?? 0)}
        market={currentMarket}
        protocolAction={ProtocolAction.supply}
        address={reserve.aToken.address}
        incentives={supplyProtocolIncentives}
        symbol={reserve.underlyingToken.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={reserve.userState!.isInIsolationMode}
          usageAsCollateralEnabledOnUser={reserve.isCollateralPosition!}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral!}
          onToggleSwitch={() => {
            openCollateralChange(
              legacyAsset,
              currentMarket,
              legacyName,
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
                assetName: reserve.underlyingToken.name,
                asset: legacyAsset,
              });
              openCollateralSwap(legacyAsset);
            }}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openSupply(legacyAsset, currentMarket, legacyName, 'dashboard')}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => {
            openWithdraw(legacyAsset, currentMarket, legacyName, 'dashboard');
          }}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
