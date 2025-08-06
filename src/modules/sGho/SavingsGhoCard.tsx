import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export interface SavingsGhoCardProps {
  // APR data
  stakingApr?: number;

  // Balance data
  sGhoBalance?: number;
  sGhoBalanceUsd?: number;

  // Cooldown status
  cooldownStatus?: 'instant' | 'cooling' | 'ready';

  // Actions
  onDeposit?: () => void;
  onWithdraw?: () => void;

  // States
  isLoading?: boolean;
  hasGhoBalance?: boolean;
}

export const SavingsGhoCard: React.FC<SavingsGhoCardProps> = ({
  stakingApr = 7.86,
  sGhoBalance = 100.0,
  sGhoBalanceUsd = 6475.12,
  cooldownStatus = 'instant',
  onDeposit,
  onWithdraw,
  isLoading = false,
  hasGhoBalance = true,
}) => {
  const theme = useTheme();

  const getCooldownStatusText = () => {
    switch (cooldownStatus) {
      case 'cooling':
        return 'Cooling down...';
      case 'ready':
        return 'Ready to withdraw';
      default:
        return 'Instant';
    }
  };

  const getCooldownStatusColor = () => {
    switch (cooldownStatus) {
      case 'cooling':
        return theme.palette.warning.main;
      case 'ready':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          <Trans>Savings GHO (sGHO)</Trans>
        </Typography>
      </Box>

      {/* Deposit Section */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subheader1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            <Trans>Deposit GHO</Trans>
          </Typography>
          <Typography variant="description" color="text.secondary">
            <Trans>
              Deposit GHO and earn up to{' '}
              <Box component="span" sx={{ color: '#338E3C', fontWeight: 'bold' }}>
                {stakingApr.toFixed(2)}%
              </Box>{' '}
              APR
            </Trans>
          </Typography>
        </Box>

        {/* Staking APR Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            <Trans>Staking APR</Trans>
          </Typography>
          <Typography
            variant="main21"
            sx={{
              fontWeight: 'bold',
              color: '#338E3C',
              fontSize: '28px',
            }}
          >
            {stakingApr.toFixed(2)} %
          </Typography>
        </Box>

        {/* Deposit Button */}
        {!hasGhoBalance ? (
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              /* Handle get GHO */
            }}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              mb: 3,
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            <Trans>Get GHO</Trans>
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={onDeposit}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              mb: 3,
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            <Trans>Deposit</Trans>
          </Button>
        )}
      </Box>

      {/* Balance Section */}
      <Box
        sx={{
          px: 3,
          py: 3,
          bgcolor: 'background.surface',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TokenIcon symbol="GHO" sx={{ fontSize: '32px' }} />
            <Typography variant="subheader1" color="text.secondary">
              sGHO
            </Typography>
          </Stack>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="main21" sx={{ fontWeight: 'bold', fontSize: '24px' }}>
              <FormattedNumber value={sGhoBalance} visibleDecimals={2} />
            </Typography>
            <Typography variant="secondary14" color="text.secondary">
              <FormattedNumber
                value={sGhoBalanceUsd}
                symbol="USD"
                symbolsColor="text.secondary"
                visibleDecimals={2}
              />
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Cooldown Section */}
      <Box sx={{ px: 3, py: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subheader2" sx={{ fontWeight: 'bold', mb: 2 }}>
          <Trans>Cooldown to unstake</Trans>
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="description" color="text.secondary">
            <Trans>Cooldown period</Trans>
          </Typography>
          <Typography
            variant="secondary14"
            sx={{
              fontWeight: 'medium',
              color: getCooldownStatusColor(),
            }}
          >
            {getCooldownStatusText()}
          </Typography>
        </Stack>

        {/* Withdraw Button - only show if there's a balance */}
        {sGhoBalance > 0 && (
          <Button
            variant="outlined"
            fullWidth
            onClick={onWithdraw}
            disabled={cooldownStatus === 'cooling'}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 'medium',
            }}
          >
            {cooldownStatus === 'cooling' ? (
              <Trans>Cooling down...</Trans>
            ) : cooldownStatus === 'ready' ? (
              <Trans>Withdraw</Trans>
            ) : (
              <Trans>Initiate Withdraw</Trans>
            )}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
