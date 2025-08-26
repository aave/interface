import { Trans } from '@lingui/macro';
import { Box, Divider, FormLabel, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';
import { Reward } from 'src/helpers/types';

import { FormattedNumber } from '../../primitives/FormattedNumber';
import { TokenIcon } from '../../primitives/TokenIcon';

export type RewardSelect = Pick<Reward, 'symbol' | 'balanceUsd'> & {
  isMeritReward?: boolean;
};

export type RewardsSelectProps = {
  rewards: RewardSelect[];
  meritRewards?: RewardSelect[];
  setSelectedReward: (key: string) => void;
  selectedReward: string;
};

export const RewardsSelect = ({
  rewards,
  meritRewards = [],
  selectedReward,
  setSelectedReward,
}: RewardsSelectProps) => {
  return (
    <FormControl sx={{ width: '100%' }}>
      <FormLabel sx={{ mb: 1, mt: 3, color: 'text.secondary' }}>
        <Trans>Rewards to claim</Trans>
      </FormLabel>

      <Select
        value={selectedReward}
        onChange={(e) => setSelectedReward(e.target.value)}
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
        renderValue={(reward) => {
          if (reward === 'all') {
            return (
              <Typography color="text.primary">
                <Trans>Claim all rewards</Trans>
              </Typography>
            );
          }
          if (reward === 'merit-all') {
            return (
              <Typography color="text.primary">
                <Trans>Claim all merit rewards</Trans>
              </Typography>
            );
          }
          if (reward === 'protocol-all') {
            return (
              <Typography color="text.primary">
                <Trans>Claim all protocol rewards</Trans>
              </Typography>
            );
          }

          // Don't render merit display items - these redirect to merit-all
          if (reward.startsWith('merit-display-')) {
            return null;
          }

          // Check protocol rewards only for individual display
          const selected = rewards.find((r) => r.symbol === reward);

          if (!selected) return null;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TokenIcon symbol={selected.symbol} sx={{ mr: 2, fontSize: '16px' }} />
              <Typography color="text.primary">{selected.symbol}</Typography>
            </Box>
          );
        }}
      >
        <MenuItem key="all-header" disabled sx={{ opacity: 1, cursor: 'default' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            <Trans>All Rewards</Trans>
          </Typography>
        </MenuItem>
        <MenuItem value={'all'}>
          <Typography variant="subheader1">
            <Trans>Claim all rewards</Trans>
          </Typography>
        </MenuItem>

        {/* Merit Rewards Section */}
        {meritRewards.length > 0 && [
          <Divider key="merit-divider" />,
          <MenuItem key="merit-header" disabled sx={{ opacity: 1, cursor: 'default' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              <Trans>Merit Rewards</Trans>
            </Typography>
          </MenuItem>,
          <MenuItem value={'merit-all'} key="merit-all">
            <Typography variant="subheader1" color="primary.main">
              <Trans>Claim all merit rewards</Trans>
            </Typography>
          </MenuItem>,
          ...meritRewards.map((reward) => (
            <MenuItem
              value={`merit-display-${reward.symbol}`}
              key={`merit-reward-${reward.symbol}`}
              sx={{
                pointerEvents: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon symbol={reward.symbol} sx={{ fontSize: '24px', mr: 3 }} />
                <Typography variant="subheader1" sx={{ mr: 1 }}>
                  {reward.symbol}
                </Typography>
                <Typography
                  ml={1}
                  variant="caption"
                  color="primary.main"
                  sx={{ fontSize: '10px', mr: 2 }}
                >
                  MERIT
                </Typography>
                <Typography
                  component="span"
                  sx={{ display: 'inline-flex', alignItems: 'center' }}
                  variant="caption"
                  color="text.muted"
                >
                  ~
                </Typography>
                <FormattedNumber
                  value={Number(reward.balanceUsd)}
                  variant="caption"
                  compact
                  symbol="USD"
                  symbolsColor="text.muted"
                  color="text.muted"
                />
              </Box>
            </MenuItem>
          )),
        ]}

        {/* Protocol Rewards Section */}
        {rewards.length > 0 && [
          <Divider key="protocol-divider" />,
          <MenuItem key="protocol-header" disabled sx={{ opacity: 1, cursor: 'default' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              <Trans>Protocol Rewards</Trans>
            </Typography>
          </MenuItem>,
          ...(rewards.length > 1
            ? [
                <MenuItem value={'protocol-all'} key="protocol-all">
                  <Typography variant="subheader1" color="text.primary">
                    <Trans>Claim all protocol rewards</Trans>
                  </Typography>
                </MenuItem>,
              ]
            : []),
          ...rewards.map((reward) => (
            <MenuItem value={reward.symbol} key={`protocol-reward-${reward.symbol}`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon symbol={reward.symbol} sx={{ fontSize: '24px', mr: 3 }} />
                <Typography variant="subheader1" sx={{ mr: 1 }}>
                  {reward.symbol}
                </Typography>
                <Typography
                  component="span"
                  sx={{ display: 'inline-flex', alignItems: 'center' }}
                  variant="caption"
                  color="text.muted"
                >
                  ~
                </Typography>
                <FormattedNumber
                  value={Number(reward.balanceUsd)}
                  variant="caption"
                  compact
                  symbol="USD"
                  symbolsColor="text.muted"
                  color="text.muted"
                />
              </Box>
            </MenuItem>
          )),
        ]}
      </Select>
    </FormControl>
  );
};
