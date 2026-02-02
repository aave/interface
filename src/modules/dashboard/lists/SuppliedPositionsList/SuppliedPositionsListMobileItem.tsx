import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const SuppliedPositionsListMobileItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const [currentMarketData, currentMarket] = useRootStore(
    useShallow((state) => [state.currentMarketData, state.currentMarket])
  );
  const { openSupply, openCollateralSwap, openWithdraw, openCollateralChange } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const {
    symbol,
    iconSymbol,
    name,
    supplyAPY,
    isIsolated,
    aIncentivesData,
    aTokenAddress,
    isFrozen,
    isActive,
    isPaused,
  } = reserve;

  // Check if asset has non-zero liquidation threshold (base or in user's e-mode)
  const userEMode = reserve.eModes?.find((e) => e.id === user?.userEmodeCategoryId);
  const hasLiquidationThreshold =
    reserve.reserveLiquidationThreshold !== '0' ||
    !!(user?.isInEmode && userEMode?.collateralEnabled);

  const canBeEnabledAsCollateral = user
    ? !debtCeiling.isMaxed &&
      hasLiquidationThreshold &&
      ((!reserve.isIsolated && !user.isInIsolationMode) ||
        user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
        (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'))
    : false;

  const disableSwap = !isActive || isPaused || reserve.symbol == 'stETH';
  const disableWithdraw = !isActive || isPaused;
  const disableSupply = !isActive || isFrozen || isPaused;

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListValueRow
        title={<Trans>Supply balance</Trans>}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <Row
        caption={<Trans>Supply APY</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(supplyAPY)}
          incentives={aIncentivesData}
          address={aTokenAddress}
          symbol={symbol}
          variant="secondary14"
          market={currentMarket}
          protocolAction={ProtocolAction.supply}
        />
      </Row>

      <Row
        caption={<Trans>Used as collateral</Trans>}
        align={isIsolated ? 'flex-start' : 'center'}
        captionVariant="description"
        mb={2}
      >
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() =>
            openCollateralChange(
              underlyingAsset,
              currentMarket,
              reserve.name,
              'dashboard',
              usageAsCollateralEnabledOnUser
            )
          }
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => openCollateralSwap(underlyingAsset)}
            fullWidth
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openSupply(underlyingAsset, currentMarket, reserve.name, 'dashboard')}
            fullWidth
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => openWithdraw(underlyingAsset, currentMarket, reserve.name, 'dashboard')}
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
