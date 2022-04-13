import { Trans } from '@lingui/macro';
import { Button, Typography, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { AMPLWarning } from '../../components/infoTooltips/AMPLWarning';
import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { TokenIcon } from '../../components/primitives/TokenIcon';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';

export const AssetsListItem = ({ ...reserve }: ComputedReserveData) => {
  const router = useRouter();
  const { currentMarket } = useProtocolDataContext();

  return (
    <ListItem
      px={6}
      minHeight={76}
      onClick={() => router.push(ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket))}
      sx={{ cursor: 'pointer' }}
      button
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {reserve.name}
          </Typography>
          <Typography variant="subheader2" color="text.muted" noWrap>
            {reserve.symbol}
          </Typography>
        </Box>

        {reserve.symbol === 'AMPL' && <AMPLWarning />}
      </ListColumn>

      <ListColumn>
        <FormattedNumber compact value={reserve.totalLiquidity} variant="main16" />
        <FormattedNumber
          compact
          value={reserve.totalLiquidityUSD}
          variant="secondary14"
          color="text.secondary"
          symbolsVariant="secondary14"
          symbolsColor="text.secondary"
          symbol="USD"
        />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.supplyAPY}
          incentives={reserve.aIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
      </ListColumn>

      <ListColumn>
        <FormattedNumber compact value={reserve.totalDebt} variant="main16" />
        <FormattedNumber
          compact
          value={reserve.totalDebtUSD}
          variant="secondary14"
          color="text.secondary"
          symbolsVariant="secondary14"
          symbolsColor="text.secondary"
          symbol="USD"
        />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.borrowingEnabled ? reserve.variableBorrowAPY : '-1'}
          incentives={reserve.vIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.stableBorrowRateEnabled ? reserve.stableBorrowAPY : -1}
          incentives={reserve.sIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
      </ListColumn>

      <ListColumn maxWidth={95} minWidth={95} align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
