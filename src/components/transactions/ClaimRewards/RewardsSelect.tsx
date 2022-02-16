import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Divider, FormLabel, SvgIcon, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';
import { Reward } from 'src/helpers/types';

import { FormattedNumber } from '../../primitives/FormattedNumber';
import { TokenIcon } from '../../primitives/TokenIcon';

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
    <FormControl sx={{ mb: 1, width: '100%' }}>
      <FormLabel sx={{ mb: 1, color: 'text.secondary' }}>
        <Trans>Reward(s) to claim</Trans>
      </FormLabel>

      <Select
        value={selectedReward}
        onChange={(e) => setSelectedReward(e.target.value as unknown as Reward)}
        sx={{
          width: '100%',
          height: '44px',
          borderRadius: '6px',
          borderColor: 'divider',
          outline: 'none !important',
          color: 'text.primary',
          '.MuiOutlinedInput-input': {
            backgroundColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline, .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            outline: 'none !important',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            borderWidth: '1px',
          },
          '.MuiSelect-icon': { color: 'text.primary' },
        }}
        native={false}
        IconComponent={(props) => (
          <SvgIcon fontSize="small" {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        )}
        renderValue={(reward) => {
          if (reward.symbol === 'all') {
            return (
              <Typography color="text.primary">
                <Trans>Claim all rewards</Trans>
              </Typography>
            );
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TokenIcon symbol={reward.symbol} sx={{ mr: 2, fontSize: '16px' }} />
              <Typography color="text.primary">{reward.symbol}</Typography>
            </Box>
          );
        }}
      >
        {rewards
          .filter((reward) => reward.symbol !== selectedReward.symbol)
          .map((reward) => (
            <React.Fragment key={`reward-token-${reward.symbol}`}>
              {/* @ts-expect-error value doesnt expect object but works */}
              <MenuItem value={reward}>
                {reward.symbol === 'all' ? (
                  <Typography variant="subheader1">
                    <Trans>Claim all rewards</Trans>
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon symbol={reward.symbol} sx={{ fontSize: '24px', mr: 3 }} />
                    <Typography variant="subheader1">{reward.symbol}</Typography>
                    <Typography
                      component="div"
                      sx={{ display: 'inline-flex', alignItems: 'center' }}
                      variant="caption"
                      color="text.disabled"
                    >
                      ~
                      <FormattedNumber
                        value={Number(reward.balanceUsd)}
                        variant="caption"
                        compact
                        symbol="USD"
                        color="text.disabled"
                      />
                    </Typography>
                  </Box>
                )}
              </MenuItem>

              {reward.symbol === 'all' && <Divider />}
            </React.Fragment>
          ))}
      </Select>
    </FormControl>
  );
};
