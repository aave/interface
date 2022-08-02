import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import getAssetCapUsage from 'src/hooks/getAssetCapUsage';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { CapsHint } from '../../../../components/caps/CapsHint';
import { CapType } from '../../../../components/caps/helper';
import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Link, ROUTES } from '../../../../components/primitives/Link';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { ListItemCanBeCollateral } from '../ListItemCanBeCollateral';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';
import { SupplyAssetsItem } from './types';

export const SupplyAssetsListMobileItem = (props: SupplyAssetsItem) => {
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
    isIsolated,
    usageAsCollateralEnabledOnUser,
    isActive,
    isFreezed,
    underlyingAsset,
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
    <ListMobileItemWrapper
      reserve={reserve}
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<Trans>Supply balance</Trans>}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
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
        caption={<Trans>Can be collateral</Trans>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <ListItemCanBeCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        <Button
          disabled={!isActive || isFreezed || Number(walletBalance) <= 0}
          variant="contained"
          onClick={() => openSupply(underlyingAsset)}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <Trans>Supply</Trans>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
