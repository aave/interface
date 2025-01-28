import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { AmountAvailableItem } from './helpers/AmountAvailableItem';
import { MultiIconWithTooltip } from './helpers/MultiIcon';

export const AvailableToClaimItem = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const icons = stakeData.formattedRewards.map((reward) => ({
    src: reward.rewardTokenSymbol,
    aToken: false,
  }));

  const totalAvailableToClaim = stakeData.formattedRewards.reduce(
    (acc, reward) => acc + +reward.accrued,
    0
  );

  const { breakpoints } = useTheme();

  const isMobile = useMediaQuery(breakpoints.down('lg'));

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
      width="100%"
    >
      <FormattedNumber value={totalAvailableToClaim} variant="main16" visibleDecimals={2} />
      {stakeData.formattedRewards.length > 1 && (
        <MultiIconWithTooltip
          icons={icons}
          tooltipContent={<AvailableToClaimTooltipContent stakeData={stakeData} />}
        />
      )}
      {stakeData.formattedRewards.length === 1 && (
        <TokenIcon symbol={stakeData.formattedRewards[0].rewardTokenSymbol} />
      )}
    </Stack>
  );
};

export const AvailableToClaimTooltipContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  return (
    <Stack direction="column" alignItems="center" justifyContent="center" minWidth={160}>
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Rewards available to claim</Trans>
      </Typography>
      <Box sx={{ width: '100%' }}>
        {stakeData.formattedRewards.map((reward, index) => (
          <AmountAvailableItem
            key={index}
            symbol={reward.rewardTokenSymbol}
            name={reward.rewardTokenSymbol}
            value={reward.accrued}
          />
        ))}
      </Box>
    </Stack>
  );
};
