import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { ListValueColumn } from '../dashboard/lists/ListValueColumn';
import { AmountAvailableItem } from './helpers/AmountAvailableItem';
import { MultiIconWithTooltip } from './helpers/MultiIcon';

export const AvailableToClaimItem = ({
  stakeData,
  isMobile,
}: {
  stakeData: MergedStakeData;
  isMobile?: boolean;
}) => {
  const icons = stakeData.formattedRewards.map((reward) => ({
    src: reward.rewardTokenSymbol,
    aToken: reward.aToken,
  }));

  const totalAvailableToClaim = stakeData.formattedRewards.reduce(
    (acc, reward) => acc + +reward.accrued,
    0
  );

  const totalAvailableToClaimUSD = stakeData.formattedRewards.reduce(
    (acc, reward) => acc + +reward.accruedUsd,
    0
  );

  return (
    <Stack
      direction={isMobile ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      gap={2}
      width="100%"
    >
      <ListValueColumn
        listColumnProps={{
          p: 0,
          minWidth: 0,
        }}
        value={totalAvailableToClaim}
        subValue={totalAvailableToClaimUSD}
        withTooltip
        disabled={totalAvailableToClaim === 0}
      />
      {stakeData.formattedRewards.length > 1 && (
        <MultiIconWithTooltip
          icons={icons}
          tooltipContent={<AvailableToClaimTooltipContent stakeData={stakeData} />}
        />
      )}
      {stakeData.formattedRewards.length === 1 && (
        <TokenIcon
          aToken={stakeData.formattedRewards[0].aToken}
          symbol={stakeData.formattedRewards[0].rewardTokenSymbol}
        />
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
