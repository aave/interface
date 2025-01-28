import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactElement } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { IconData, MultiIconWithTooltip } from './helpers/MultiIcon';

export const StakingApyItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { reserves } = useAppDataContext();

  const { breakpoints } = useTheme();

  const isMobile = useMediaQuery(breakpoints.down('lg'));

  let netAPY = 0;
  const icons: IconData[] = [];
  const stakeRewards: StakingReward[] = [];
  for (const reward of stakeData.rewards) {
    netAPY += +reward.apy;
    icons.push({ src: reward.rewardSymbol, aToken: false });
    stakeRewards.push({
      address: reward.rewardAddress,
      symbol: reward.rewardSymbol,
      name: reward.rewardSymbol,
      aToken: false,
      apy: reward.apy,
    });
  }

  if (stakeData.underlyingIsWaToken) {
    const underlyingReserve = reserves.find(
      (reserve) => reserve.underlyingAsset === stakeData.waTokenData.waTokenUnderlying
    );

    if (!underlyingReserve) {
      throw new Error(
        `Underlying reserve not found for waToken underlying ${stakeData.waTokenData.waTokenUnderlying}`
      );
    }

    netAPY += +underlyingReserve.supplyAPY;
    icons.push({ src: underlyingReserve.symbol, aToken: true });
    stakeRewards.push({
      address: stakeData.waTokenData.waTokenUnderlying,
      symbol: underlyingReserve.symbol,
      name: `a${underlyingReserve.symbol}`,
      aToken: true,
      apy: underlyingReserve.supplyAPY,
    });
  }

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <FormattedNumber value={netAPY} percent variant="main16" visibleDecimals={2} />
      <MultiIconWithTooltip
        icons={icons}
        tooltipContent={
          <StakingApyTooltipcontent
            description={
              <Typography variant="caption" color="text.secondary" mb={3}>
                {stakeData.underlyingIsWaToken ? (
                  <Trans>
                    Staking this asset will earn the underlying asset supply yield in additon to
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
}

export const StakingApyTooltipcontent = ({
  description,
  rewards,
}: {
  description: ReactElement;
  rewards: StakingReward[];
}) => {
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
        {rewards.map((reward) => {
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
                </Stack>
              }
              key={reward.address}
              width="100%"
            >
              <Stack direction="row">
                <FormattedNumber value={+reward.apy} percent variant="secondary12" />
                <Typography variant="secondary12" sx={{ ml: 1 }}>
                  <Trans>APR</Trans>
                </Typography>
              </Stack>
            </Row>
          );
        })}
      </Box>
    </Box>
  );
};
