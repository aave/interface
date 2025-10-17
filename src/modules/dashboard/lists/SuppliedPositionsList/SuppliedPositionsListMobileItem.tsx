import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
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
  usageAsCollateralEnabledOnUser,
  symbol,
  name,
  iconSymbol,
}: DashboardReserve) => {
  const [currentMarketData, currentMarket] = useRootStore(
    useShallow((state) => [state.currentMarketData, state.currentMarket])
  );

  const { openSupply, openCollateralSwap, openWithdraw, openCollateralChange } = useModalContext();

  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  const { isFrozen, isPaused } = reserve;

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
  const canBeEnabledAsCollateral = reserve.usageAsCollateralEnabledOnUser;
  const disableSwap = isPaused || reserve.underlyingToken.symbol == 'stETH';
  const disableWithdraw = isPaused;
  const disableSupply = isFrozen || isPaused;

  return (
    <ListMobileItemWrapper
      symbol={symbol ?? reserve.underlyingToken.symbol}
      iconSymbol={iconSymbol ?? displayIconSymbol}
      name={name ?? reserve.underlyingToken.name}
      underlyingAsset={reserve.underlyingToken.address.toLowerCase()}
      currentMarket={currentMarket}
      frozen={isFrozen}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        symbol || reserve.underlyingToken.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListValueRow
        title={<Trans>Supply balance</Trans>}
        value={Number(reserve.balancePosition?.amount.value ?? 0)}
        subValue={Number(reserve.balancePosition?.usd ?? 0)}
        disabled={Number(reserve.balancePosition?.amount.value ?? 0) === 0}
      />

      <Row
        caption={<Trans>Supply APY</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(reserve.supplyInfo.apy.value ?? 0)}
          incentives={supplyProtocolIncentives}
          address={reserve.aToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="secondary14"
          market={currentMarket}
          protocolAction={ProtocolAction.supply}
        />
      </Row>

      <Row
        caption={<Trans>Used as collateral</Trans>}
        align={reserve.userState?.isInIsolationMode ? 'flex-start' : 'center'}
        captionVariant="description"
        mb={2}
      >
        <ListItemUsedAsCollateral
          disabled={isPaused}
          isIsolated={reserve.userState!.isInIsolationMode}
          usageAsCollateralEnabledOnUser={reserve.isCollateralPosition!}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral!}
          onToggleSwitch={() =>
            openCollateralChange(
              reserve.underlyingToken.address.toLowerCase(),
              currentMarket,
              reserve.underlyingToken.name,
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
            onClick={() => openCollateralSwap(reserve.underlyingToken.address.toLowerCase())}
            fullWidth
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() =>
              openSupply(
                reserve.underlyingToken.address.toLowerCase(),
                currentMarket,
                reserve.underlyingToken.name,
                'dashboard'
              )
            }
            fullWidth
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() =>
            openWithdraw(
              reserve.underlyingToken.address.toLowerCase(),
              currentMarket,
              reserve.underlyingToken.name,
              'dashboard'
            )
          }
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
