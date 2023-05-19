import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
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
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openSwap, openWithdraw, openCollateralChange } = useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const { symbol, iconSymbol, name, supplyAPY, isIsolated, aIncentivesData, isFrozen, isActive } =
    reserve;

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== '0' &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'));

  const POLYGON_DISABLED_ASSETS = ['WETH', 'WMATIC', 'WBTC', 'USDT'];
  const isPolygonV2 = currentMarketData.chainId === ChainId.polygon && !currentMarketData.v3;

  const disableSwap =
    !isActive ||
    reserve.symbol == 'stETH' ||
    (isPolygonV2 && POLYGON_DISABLED_ASSETS.includes(reserve.symbol));
  const disableWithdraw =
    !isActive || isPolygonV2 || (isPolygonV2 && POLYGON_DISABLED_ASSETS.includes(reserve.symbol));
  const disableSupply =
    !isActive ||
    isFrozen ||
    isPolygonV2 ||
    (isPolygonV2 && POLYGON_DISABLED_ASSETS.includes(reserve.symbol));

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
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={<Trans>Used as collateral</Trans>}
        align={isIsolated ? 'flex-start' : 'center'}
        captionVariant="description"
        mb={2}
      >
        <ListItemUsedAsCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => openCollateralChange(underlyingAsset)}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={disableWithdraw}
          variant="contained"
          onClick={() => openWithdraw(underlyingAsset)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Withdraw</Trans>
        </Button>

        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="outlined"
            onClick={() => openSwap(underlyingAsset)}
            fullWidth
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="outlined"
            onClick={() => openSupply(underlyingAsset)}
            fullWidth
          >
            <Trans>Supply</Trans>
          </Button>
        )}
      </Box>
    </ListMobileItemWrapper>
  );
};
