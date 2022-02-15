import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import * as React from 'react';
import { Reward } from 'src/helpers/types';

import { FormattedNumber } from '../../primitives/FormattedNumber';
import { TokenIcon } from '../../primitives/TokenIcon';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export type RewardsSelectProps = {
  rewards: Reward[];
  setSelectedReward: React.Dispatch<React.SetStateAction<Reward | undefined>>;
  selectedReward: Reward;
};

export const RewardsSelect = ({
  rewards,
  selectedReward,
  setSelectedReward,
}: RewardsSelectProps) => {
  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <Select
          value={selectedReward}
          onChange={(e) => setSelectedReward(e.target.value as unknown as Reward)}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
          native={false}
          renderValue={(reward) => {
            if (reward.symbol === 'all') {
              return (
                <Typography>
                  <Trans>Claim all rewards</Trans>
                </Typography>
              );
            }

            return (
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TokenIcon symbol={reward.symbol} sx={{ mx: '4px' }} />
                <Typography>{reward.symbol}</Typography>
              </Box>
            );
          }}
        >
          {rewards
            .filter((reward) => reward.symbol !== selectedReward.symbol)
            .map((reward) => (
              // @ts-expect-error value doesnt expect object but works
              <MenuItem key={`reward-token-${reward.symbol}`} value={reward}>
                {reward.symbol === 'all' ? (
                  <Typography>
                    <Trans>Claim all rewards</Trans>
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                      <TokenIcon symbol={reward.symbol} sx={{ mx: '4px' }} />
                      <Typography>{reward.symbol}</Typography>
                      <FormattedNumber
                        value={Number(reward.balanceUsd)}
                        variant="helperText"
                        compact
                        symbol="USD"
                      />
                    </Box>
                  </Box>
                )}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};
