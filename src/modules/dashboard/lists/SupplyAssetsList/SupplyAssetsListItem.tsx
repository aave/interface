import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import getAssetCapUsage from 'src/hooks/getAssetCapUsage';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { ListColumn } from '../../../../components/lists/ListColumn';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemCanBeCollateral } from '../ListItemCanBeCollateral';
import { ListItemWrapper } from '../ListItemWrapper';
import { ListValueColumn } from '../ListValueColumn';
import { SupplyAssetsItem } from './types';

export const SupplyAssetsListItem = (props: SupplyAssetsItem) => {
  const {
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
    reserve,
  } = props;
  const { currentMarket } = useProtocolDataContext();
  const { openSupply } = useModalContext();

  // Hide the asset to prevent it from being supplied if supply cap has been reached
  const {
    supplyCap: { isMaxed },
  } = getAssetCapUsage(reserve);
  if (isMaxed) return null;

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={detailsAddress}
      data-cy={`dashboardSupplyListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
    >
      <ListValueColumn
        symbol={symbol}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
        withTooltip
        disabled={Number(walletBalance) === 0}
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
        <ListItemCanBeCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
        />
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={!isActive || isFreezed || Number(walletBalance) <= 0}
          variant="contained"
          onClick={() => openSupply(underlyingAsset)}
        >
          <Trans>Supply</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
