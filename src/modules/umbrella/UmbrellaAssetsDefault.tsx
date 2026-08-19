import { Trans } from '@lingui/macro';
import { Box, Paper, Skeleton, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { FormattedStakeData, useStakeDataSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useCoingeckoCategories } from 'src/hooks/useCoinGeckoCategories';
import {
  AssetCategory,
  matchesSelectedCategories,
} from 'src/modules/markets/utils/assetCategories';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';
import { NoStakeAssets } from './NoStakeAssets';
import { StakeAssetName } from './StakeAssets/StakeAssetName';
import { StakeAssetsFilters } from './StakeAssets/StakeAssetsFilters';

export const UmrellaAssetsDefaultListContainer = () => {
  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCoingeckoCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const filteredAssets = stakeData?.stakeAssets
    // Search by asset symbol
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      return res.symbol.toLowerCase().includes(term);
    })
    // Category filter (shares the markets page's dynamic CoinGecko categorization)
    .filter((res) =>
      matchesSelectedCategories(
        res.symbol,
        selectedCategories,
        categoryData?.stablecoinSymbols,
        categoryData?.ethCorrelatedSymbols
      )
    );

  const noStakeAssetsConfigured = !loading && (!stakeData || stakeData.stakeAssets.length === 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <StakeAssetsFilters
        searchPlaceholder={sm ? 'Search asset' : 'Search asset name or symbol'}
        onSearchTermChange={setSearchTerm}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        categoriesDisabled={isLoadingCategories || !!categoriesError}
      />

      <Paper variant="card" sx={{ '& > div:first-of-type > hr': { display: 'none' } }}>
        <UmbrellaAssetsDefault stakeAssets={filteredAssets ?? []} loading={loading} />

        {noStakeAssetsConfigured ? (
          <NoStakeAssets />
        ) : (
          !loading &&
          filteredAssets?.length === 0 && (
            <NoSearchResults
              searchTerm={searchTerm}
              subtitle={<Trans>We couldn&apos;t find any assets related to your search.</Trans>}
            />
          )
        )}
      </Paper>
    </Box>
  );
};

export const UmbrellaAssetsDefault = ({
  stakeAssets,
  loading,
}: {
  stakeAssets: FormattedStakeData[];
  loading: boolean;
}) => {
  const theme = useTheme();
  const isTableChangedToCards = useMediaQuery(theme.breakpoints.down('mdlg'));

  if (loading) {
    return isTableChangedToCards ? (
      <>
        <DefaultAssetListItemLoaderMobile />
        <DefaultAssetListItemLoaderMobile />
        <DefaultAssetListItemLoaderMobile />
        <DefaultAssetListItemLoaderMobile />
      </>
    ) : (
      <Box pt={10}>
        <DefaultAssetListItemLoader />
        <DefaultAssetListItemLoader />
        <DefaultAssetListItemLoader />
        <DefaultAssetListItemLoader />
      </Box>
    );
  }

  // Empty states (no assets configured / no search results) are handled by the container.
  if (stakeAssets.length === 0) {
    return null;
  }

  return (
    <>
      {!isTableChangedToCards && (
        <ListHeaderWrapper>
          <ListColumn isRow>
            <ListHeaderTitle>
              <Trans>Asset</Trans>
            </ListHeaderTitle>
          </ListColumn>
          <ListColumn>
            <ListHeaderTitle>
              <Trans>APY</Trans>
            </ListHeaderTitle>
          </ListColumn>
        </ListHeaderWrapper>
      )}
      {stakeAssets.map((data, index) =>
        !isTableChangedToCards ? (
          <AssetListItem key={index} stakeData={data} />
        ) : (
          <AssetListItemMobile key={index} stakeData={data} />
        )
      )}
    </>
  );
};

const AssetListItem = ({ stakeData }: { stakeData: FormattedStakeData }) => {
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));
  return (
    <ListItem>
      <ListColumn isRow minWidth={275}>
        <StakeAssetName
          iconSymbol={stakeData.iconSymbol}
          symbol={stakeData.symbol}
          totalAmountStakedUSD={stakeData.totalSupplyUsd}
          targetLiquidityUSD={stakeData.targetLiquidityUSD}
          apyAtTargetLiquidity={stakeData.totalRewardApyAtTargetLiquidity}
          explorerUrl={`${currentNetworkConfig.explorerLink}/address/${stakeData.tokenAddress}`}
        />
      </ListColumn>
      <ListColumn>
        <FormattedNumber
          value={stakeData.totalRewardApy}
          percent
          variant="h4"
          visibleDecimals={2}
        />
      </ListColumn>
    </ListItem>
  );
};

const AssetListItemMobile = ({ stakeData }: { stakeData: FormattedStakeData }) => {
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));
  return (
    <ListMobileItemWrapper>
      <ListColumn isRow>
        <StakeAssetName
          iconSymbol={stakeData.iconSymbol}
          symbol={stakeData.symbol}
          totalAmountStakedUSD={stakeData.totalSupplyUsd}
          targetLiquidityUSD={stakeData.targetLiquidityUSD}
          apyAtTargetLiquidity={stakeData.totalRewardApyAtTargetLiquidity}
          explorerUrl={`${currentNetworkConfig.explorerLink}/address/${stakeData.tokenAddress}`}
        />
      </ListColumn>
      <Row mt={8} px={2} caption={<Trans>Staking APY</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <FormattedNumber
            value={stakeData.totalRewardApy}
            percent
            variant="h5"
            visibleDecimals={2}
          />
        </Box>
      </Row>
    </ListMobileItemWrapper>
  );
};

const DefaultAssetListItemLoader = () => {
  return (
    <ListItem px={4} minHeight={76}>
      <ListColumn isRow minWidth={275}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ pl: 2, overflow: 'hidden' }}>
          <Skeleton width={150} height={28} />
        </Box>
      </ListColumn>
      <ListColumn>
        <Skeleton width={50} height={28} />
      </ListColumn>
    </ListItem>
  );
};

const DefaultAssetListItemLoaderMobile = () => {
  return (
    <ListMobileItemWrapper>
      <ListColumn isRow>
        <Stack direction="row" alignItems="center" height={40}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ pl: 2, overflow: 'hidden' }}>
            <Skeleton width={150} height={28} />
          </Box>
        </Stack>
      </ListColumn>
      <Row
        mt={8}
        mb={3}
        px={2}
        caption={<Skeleton width={100} height={20} />}
        captionVariant="description"
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>
    </ListMobileItemWrapper>
  );
};
