import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { MultiIconWithTooltip } from './helpers/MultiIcon';
import { Rewards } from './services/StakeDataProviderService';

export const StakingApyItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { reserves } = useAppDataContext();

  const rewards = stakeData.rewards;

  // TODO: do we need to handle the case where aTokens are configured as a reward?
  const icons = rewards.map((reward) => ({ src: reward.rewardSymbol, aToken: false }));
  let netAPY = rewards.reduce((acc, reward) => {
    return acc + +reward.apy;
  }, 0);

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
  }

  console.log(icons);

  return (
    <Stack direction="column" alignItems="center" justifyContent="center">
      <FormattedNumber value={netAPY} percent variant="main16" visibleDecimals={2} />
      <MultiIconWithTooltip
        icons={icons}
        tooltipContent={<StakingApyTooltipcontent rewards={rewards} apr={netAPY.toString()} />}
      />
    </Stack>
  );
};

export const StakingApyTooltipcontent = ({ rewards, apr }: { rewards: Rewards[]; apr: string }) => {
  const typographyVariant = 'secondary12';

  const Number = ({ incentiveAPR }: { incentiveAPR: 'Infinity' | number | string }) => {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {incentiveAPR !== 'Infinity' ? (
          <>
            <FormattedNumber value={+incentiveAPR} percent variant={typographyVariant} />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant={typographyVariant}>∞ %</Typography>
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>lorem ipsum</Trans>
      </Typography>

      <Box sx={{ width: '100%' }}>
        {rewards.map((reward) => {
          return (
            <Row
              height={32}
              caption={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: rewards.length > 1 ? 2 : 0,
                  }}
                >
                  <TokenIcon symbol={reward.rewardSymbol} sx={{ fontSize: '20px', mr: 1 }} />
                  <Typography variant={typographyVariant}>{reward.rewardSymbol}</Typography>
                </Box>
              }
              key={reward.rewardAddress}
              width="100%"
            >
              <Number incentiveAPR={reward.apy} />
            </Row>
          );
        })}

        {rewards.length > 1 && (
          <Box sx={() => ({ pt: 1, mt: 1 })}>
            <Row caption={<Trans>Net APR</Trans>} height={32}>
              <Number incentiveAPR={apr} />
            </Row>
          </Box>
        )}
      </Box>
    </Box>
  );
};
