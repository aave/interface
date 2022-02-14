import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';

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

export const SupplyAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  liquidityRate,
  aIncentives,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  isActive,
  isFreezed,
  underlyingAsset,
}: SupplyAssetsItem) => {
  const { openSupply } = useModalContext();

  return (
    <ListMobileItemWrapper symbol={symbol} iconSymbol={iconSymbol} name={name}>
      <ListValueRow
        title={<Trans>Supply balance</Trans>}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
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
          value={Number(liquidityRate)}
          incentives={aIncentives}
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
          href={ROUTES.reserveOverview(underlyingAsset)}
          fullWidth
        >
          <Trans>Details</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
