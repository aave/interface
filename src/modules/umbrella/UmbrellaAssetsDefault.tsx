import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { FormattedStakeData, useStakeDataSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';
import { NoStakeAssets } from './NoStakeAssets';
import { StakeAssetName } from './StakeAssets/StakeAssetName';

export const UmrellaAssetsDefaultListContainer = () => {
  return (
    <ListWrapper
      titleComponent={
        <Typography variant="h2">
          <Trans>Assets to stake</Trans>
        </Typography>
      }
    >
      <UmbrellaAssetsDefault />
    </ListWrapper>
  );
};
export const UmbrellaAssetsDefault = () => {
  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);

  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');

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

  if (!loading && (!stakeData || stakeData.stakeAssets.length === 0)) {
    return <NoStakeAssets />;
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
      {stakeData &&
        stakeData.stakeAssets.map((data, index) =>
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
          variant="main16"
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
            variant="secondary14"
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
