import { Trans } from '@lingui/macro';
import { Box, Skeleton, Typography, useMediaQuery } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { FormattedStakeData, useStakeDataSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { StakeAssetName } from './StakeAssets/StakeAssetName';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

export const UmbrellaAssetsDefault = () => {
  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);

  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');

  return (
    <ListWrapper
      titleComponent={
        <Typography variant="h2">
          <Trans>Assets to stake</Trans>
        </Typography>
      }
    >
      {loading ? (
        <>
          <DefaultAssetListItemLoader />
          <DefaultAssetListItemLoader />
          <DefaultAssetListItemLoader />
          <DefaultAssetListItemLoader />
        </>
      ) : (
        <>
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
          {!stakeData || stakeData.length === 0 ? (
            <>no stake assets</>
          ) : (
            stakeData.map((data) => <AssetListItem stakeData={data} />)
          )}
        </>
      )}
    </ListWrapper>
  );
};

const DefaultAssetsListMobile = ({ stakeData }: { stakeData: FormattedStakeData }) => {};

const AssetListItem = ({ stakeData }: { stakeData: FormattedStakeData }) => {
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));
  return (
    <ListItem>
      <ListColumn isRow minWidth={275}>
        <StakeAssetName
          iconSymbol={stakeData.iconSymbol}
          symbol={stakeData.symbol}
          totalAmountStaked={stakeData.stakeTokenTotalSupply}
          totalAmountStakedUSD={stakeData.totalSupplyUsd}
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

const DefaultAssetListItemLoader = () => {
  return (
    <ListItem px={6} minHeight={76}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>
    </ListItem>
  );
};
