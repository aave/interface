import { Trans } from '@lingui/macro';
import { Button, Divider } from '@mui/material';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';

export const AssetsListMobileItem = ({ ...reserve }: ComputedReserveData) => {
  return (
    <ListMobileItemWrapper
      symbol={reserve.iconSymbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      underlyingAsset={reserve.underlyingAsset}
    >
      <Row caption={<Trans>Total supplied</Trans>} captionVariant="description" mb={3}>
        <FormattedNumber
          compact
          value={reserve.totalLiquidityUSD}
          variant="secondary14"
          symbol="USD"
        />
      </Row>
      <Row
        caption={<Trans>Supply APY</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={reserve.supplyAPY}
          incentives={reserve.aIncentivesData || []}
          symbol={reserve.symbol}
          variant="secondary14"
        />
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row caption={<Trans>Total borrowed</Trans>} captionVariant="description" mb={3}>
        <FormattedNumber compact value={reserve.totalDebtUSD} variant="secondary14" symbol="USD" />
      </Row>
      <Row
        caption={<Trans>Borrow APY, variable</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={reserve.borrowingEnabled ? reserve.variableBorrowAPY : '-1'}
          incentives={reserve.vIncentivesData || []}
          symbol={reserve.symbol}
          variant="secondary14"
        />
      </Row>
      <Row
        caption={<Trans>Borrow APY, stable</Trans>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={reserve.stableBorrowRateEnabled ? reserve.stableBorrowAPY : -1}
          incentives={reserve.sIncentivesData || []}
          symbol={reserve.symbol}
          variant="secondary14"
        />
      </Row>

      <Button
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(reserve.underlyingAsset)}
        fullWidth
      >
        <Trans>View details</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
