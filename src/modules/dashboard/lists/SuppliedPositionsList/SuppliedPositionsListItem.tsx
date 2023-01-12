import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useHelpContext } from 'src/hooks/useHelp';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { HelpTooltip } from 'src/components/infoTooltips/HelpTooltip';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
  index,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { isIsolated, aIncentivesData, isFrozen, isActive } = reserve;
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openWithdraw, openCollateralChange, openSwap } = useModalContext();
  const { pagination, setHelpTourAsset } = useHelpContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  if (index === 0) setHelpTourAsset(underlyingAsset);

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.usageAsCollateralEnabled &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'));

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={reserve.iconSymbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => openCollateralChange(underlyingAsset)}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        {index === 0 &&
        localStorage.getItem('Withdrawal Tour') === 'false' &&
        pagination['WithdrawTour'] === 1 ? (
          <Button
            disabled={!isActive}
            variant="contained"
            onClick={() => openWithdraw(underlyingAsset)}
          >
            <HelpTooltip
              title={'Withdraw your assets from AAVE'}
              description={
                'To withdraw an asset, go to the "Your Supply" section and click on "Withdraw" for the asset you wish to withdraw.'
              }
              pagination={pagination['WithdrawTour']}
              placement={'top-start'}
              top={'-8px'}
              right={'68px'}
              offset={[-7, 14]}
            />
            <Trans>Withdraw</Trans>
          </Button>
        ) : (
          <Button
            disabled={!isActive}
            variant="contained"
            onClick={() => openWithdraw(underlyingAsset)}
          >
            <Trans>Withdraw</Trans>
          </Button>
        )}

        {isSwapButton ? (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSwap(underlyingAsset)}
            data-cy={`swapButton`}
          >
            <Trans>Swap</Trans>
          </Button>
        ) : (
          <Button
            disabled={!isActive || isFrozen}
            variant="outlined"
            onClick={() => openSupply(underlyingAsset)}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
