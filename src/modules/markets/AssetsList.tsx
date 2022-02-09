import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { ListColumn } from '../../components/lists/ListColumn';
import { ListHeaderTitle } from '../../components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from '../../components/lists/ListHeaderWrapper';
import { ListItem } from '../../components/lists/ListItem';
import { ListWrapper } from '../../components/lists/ListWrapper';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';

export default function AssetsList() {
  const { reserves } = useAppDataContext();
  const { currentMarketData } = useProtocolDataContext();

  const filteredData = reserves.filter((res) => res.isActive);

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  if (sortDesc) {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 0));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredData.sort((a, b) => a[sortName] - b[sortName]);
    }
  } else {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 0));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredData.sort((a, b) => b[sortName] - a[sortName]);
    }
  }

  const header = [
    {
      title: <Trans>Asset</Trans>,
      sortKey: 'symbol',
    },
    {
      title: <Trans>Total supplied</Trans>,
      sortKey: 'totalLiquidityUSD',
    },
    {
      title: <Trans>Supply APY</Trans>,
      sortKey: 'supplyAPY',
    },
    {
      title: <Trans>Total borrowed</Trans>,
      sortKey: 'totalDebtUSD',
    },
    {
      title: <Trans>Borrow APY, variable</Trans>,
      sortKey: 'variableBorrowAPY',
    },
    {
      title: <Trans>Borrow APY, stable</Trans>,
      sortKey: 'stableBorrowAPY',
    },
  ];

  return (
    <ListWrapper
      title={
        <>
          {currentMarketData.marketTitle} <Trans>assets</Trans>
        </>
      }
      captionSize="h2"
    >
      <ListHeaderWrapper px={6}>
        {header.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? 280 : undefined}
            key={col.sortKey}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListColumn maxWidth={95} minWidth={95} />
      </ListHeaderWrapper>

      {filteredData.map((reserve) => (
        <ListItem px={6} minHeight={76} key={reserve.id}>
          <ListColumn isRow maxWidth={280}>
            <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
            <Box sx={{ pl: 3.5 }}>
              <Typography variant="h4">{reserve.name}</Typography>
              <Typography variant="subheader2" color="text.disabled">
                {reserve.symbol}
              </Typography>
            </Box>
          </ListColumn>

          <ListColumn>
            <FormattedNumber
              compact
              value={reserve.totalLiquidityUSD}
              variant="main16"
              symbol="USD"
            />
          </ListColumn>

          <ListColumn>
            <IncentivesCard
              value={reserve.supplyAPY}
              incentives={reserve.aIncentivesData || []}
              symbol={reserve.symbol}
              variant="main16"
            />
          </ListColumn>

          <ListColumn>
            <FormattedNumber compact value={reserve.totalDebtUSD} variant="main16" symbol="USD" />
          </ListColumn>

          <ListColumn>
            <IncentivesCard
              value={reserve.variableBorrowAPY}
              incentives={reserve.vIncentivesData || []}
              symbol={reserve.symbol}
              variant="main16"
            />
          </ListColumn>

          <ListColumn>
            <IncentivesCard
              value={reserve.stableBorrowRateEnabled ? reserve.stableBorrowAPY : -1}
              incentives={reserve.sIncentivesData || []}
              symbol={reserve.symbol}
              variant="main16"
            />
          </ListColumn>

          <ListColumn maxWidth={95} minWidth={95} align="right">
            <Button
              variant="outlined"
              component={Link}
              href={ROUTES.reserveOverview(reserve.underlyingAsset)}
            >
              <Trans>Details</Trans>
            </Button>
          </ListColumn>
        </ListItem>
      ))}
    </ListWrapper>
  );
}
