import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListHeaderTitle } from '../../components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from '../../components/lists/ListHeaderWrapper';
import { ListWrapper } from '../../components/lists/ListWrapper';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { AssetListTitle } from './AssetListTitle';
import { AssetsListItem } from './AssetsListItem';
import { AssetsListItemLoader } from './AssetsListItemLoader';
import { AssetsListMobileItem } from './AssetsListMobileItem';
import { AssetsListMobileItemLoader } from './AssetsListMobileItemLoader';

export default function AssetsList() {
  const { reserves, loading } = useAppDataContext();
  const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();

  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = reserves
    .filter((res) => res.isActive)
    .filter((res) => {
      if (!searchTerm) return true;
      return (
        res.symbol.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        res.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        res.underlyingAsset.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    })
    .map((reserve) => ({
      ...reserve,
      ...(reserve.isWrappedBaseAsset
        ? fetchIconSymbolAndName({
            symbol: currentNetworkConfig.baseAssetSymbol,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          })
        : {}),
    }));

  if (sortDesc) {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 1));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredData.sort((a, b) => a[sortName] - b[sortName]);
    }
  } else {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 1));
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
      title: (
        <VariableAPYTooltip
          text={<Trans>Borrow APY, variable</Trans>}
          key="APY_list_variable_type"
          variant="subheader2"
        />
      ),
      sortKey: 'variableBorrowAPY',
    },
    {
      title: (
        <StableAPYTooltip
          text={<Trans>Borrow APY, stable</Trans>}
          key="APY_list_stable_type"
          variant="subheader2"
        />
      ),
      sortKey: 'stableBorrowAPY',
    },
  ];

  const marketFrozen = !reserves.some((reserve) => !reserve.isFrozen);

  return (
    <ListWrapper
      title={
        <AssetListTitle
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          marketTitle={currentMarketData.marketTitle}
        />
      }
    >
      {marketFrozen && currentNetworkConfig.name === 'Harmony' && (
        <Box sx={{ mx: '24px' }}>
          <MarketWarning marketName="Harmony" forum={true} />
        </Box>
      )}

      {marketFrozen && currentNetworkConfig.name === 'Fantom' && (
        <Box sx={{ mx: '24px' }}>
          <MarketWarning marketName="Fantom" forum={true} />
        </Box>
      )}

      {!isTableChangedToCards && (
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
      )}

      {loading ? (
        isTableChangedToCards ? (
          <>
            <AssetsListMobileItemLoader />
            <AssetsListMobileItemLoader />
            <AssetsListMobileItemLoader />
          </>
        ) : (
          <>
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
          </>
        )
      ) : (
        filteredData.map((reserve) =>
          isTableChangedToCards ? (
            <AssetsListMobileItem {...reserve} key={reserve.id} />
          ) : (
            <AssetsListItem {...reserve} key={reserve.id} />
          )
        )
      )}
      {!loading && filteredData?.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            pt: 15,
            pb: 40,
            px: 4,
            overflow: 'hidden',
          }}
        >
          <Typography sx={{ textAlign: 'center' }} variant="h2">
            <Trans>No search results for</Trans> &apos;{searchTerm}&apos;
          </Typography>
          <Typography
            sx={{ width: '280px', textAlign: 'center' }}
            variant="description"
            color="text.secondary"
          >
            <Trans>
              We couldn&apos;t find any asset matching your search. Try again with a different asset
              name, symbol, or address.
            </Trans>
          </Typography>
        </Box>
      )}
    </ListWrapper>
  );
}
