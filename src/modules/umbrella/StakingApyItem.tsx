import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import invariant from 'tiny-invariant';

import { IconData, MultiIconWithTooltip } from './helpers/MultiIcon';

export const StakingApyItem = ({
  stakeData,
  isMobile,
}: {
  stakeData: MergedStakeData;
  isMobile?: boolean;
}) => {
  const { reserves } = useAppDataContext();

  const icons: IconData[] = [];
  const stakeRewards: StakingReward[] = [];

  for (const reward of stakeData.formattedRewards) {
    const reserveAToken = reserves.find(
      (elem) => elem.aTokenAddress.toLowerCase() === reward.rewardToken.toLowerCase()
    );
    if (reserveAToken) {
      icons.push({ src: reserveAToken.symbol, aToken: true });
      stakeRewards.push({
        address: reward.rewardToken,
        symbol: reserveAToken.symbol,
        name: `a${reserveAToken.symbol}`,
        aToken: true,
        apy: reward.apy,
      });
    } else {
      icons.push({ src: reward.rewardTokenSymbol, aToken: false });
      stakeRewards.push({
        address: reward.rewardToken,
        symbol: reward.rewardTokenSymbol,
        name: reward.rewardTokenSymbol,
        aToken: false,
        apy: reward.apy,
      });
    }
  }

  if (stakeData.underlyingIsStataToken) {
    const underlyingReserve = reserves.find(
      (reserve) => reserve.underlyingAsset === stakeData.stataTokenData.asset.toLowerCase()
    );
    invariant(
      underlyingReserve,
      `Underlying reserve not found for waToken underlying ${stakeData.stataTokenData.asset}`
    );

    icons.push({ src: underlyingReserve.symbol, aToken: true });
    stakeRewards.push({
      address: stakeData.stataTokenData.asset,
      symbol: underlyingReserve.symbol,
      name: `a${underlyingReserve.symbol}`,
      aToken: true,
      apy: underlyingReserve.supplyAPY,
      fromSupply: true,
    });
  }

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <FormattedNumber
        value={stakeData.totalRewardApy}
        percent
        variant="secondary14"
        visibleDecimals={2}
      />
      <MultiIconWithTooltip
        icons={icons}
        tooltipContent={
          <StakingApyTooltipcontent
            description={
              <Typography variant="caption" color="text.secondary" mb={3}>
                {stakeData.underlyingIsStataToken ? (
                  <Trans>
                    Staking this asset will earn the underlying asset supply yield in addition to
                    other configured rewards.
                  </Trans>
                ) : (
                  <Trans>Staking Rewards</Trans>
                )}
              </Typography>
            }
            rewards={stakeRewards}
          />
        }
      />
    </Stack>
  );
};

interface StakingReward {
  symbol: string;
  name: string;
  address: string;
  aToken: boolean;
  apy: string;
  fromSupply?: boolean;
}

export const StakingApyTooltipcontent = ({
  description,
  rewards,
}: {
  description: ReactElement;
  rewards: StakingReward[];
}) => {
  const totalApy = rewards.reduce((sum, reward) => sum + parseFloat(reward.apy), 0);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {description}

      <Box sx={{ width: '100%', minWidth: '160px' }}>
        {rewards.map((reward, index) => {
          return (
            <Row
              sx={{ mb: 2 }}
              caption={
                <Stack direction="row" alignItems="center">
                  <TokenIcon
                    aToken={reward.aToken}
                    symbol={reward.symbol}
                    sx={{ fontSize: '20px', mr: 1 }}
                  />
                  <Typography variant="secondary12">{reward.name}</Typography>
                  {reward.fromSupply && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (<Trans>supply</Trans>)
                    </Typography>
                  )}
                </Stack>
              }
              key={index}
              width="100%"
            >
              <Stack direction="row">
                <FormattedNumber value={+reward.apy} percent variant="secondary12" />
                <Typography variant="secondary12" sx={{ ml: 1 }}>
                  <Trans>APY</Trans>
                </Typography>
              </Stack>
            </Row>
          );
        })}

        {rewards.length > 1 && (
          <Row
            sx={{
              mt: 1,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
            caption={
              <Typography variant="secondary12" fontWeight="medium">
                <Trans>Total</Trans>
              </Typography>
            }
            width="100%"
          >
            <Stack direction="row">
              <FormattedNumber value={totalApy} percent variant="secondary12" fontWeight="medium" />
              <Typography variant="secondary12" fontWeight="medium" sx={{ ml: 1 }}>
                <Trans>APY</Trans>
              </Typography>
            </Stack>
          </Row>
        )}
      </Box>
    </Box>
  );
};
