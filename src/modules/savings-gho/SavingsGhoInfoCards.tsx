import { Trans } from '@lingui/macro';
import { Box, Paper, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { MeritIncentivesData } from 'src/hooks/useMeritIncentives';
import { useRootStore } from 'src/store/root';

interface SavingsGhoInfoCardsProps {
  stakeData?: StakeTokenFormatted;
  meritIncentives?: MeritIncentivesData;
  loading: boolean;
}

export const SavingsGhoInfoCards = ({
  stakeData,
  meritIncentives,
  loading,
}: SavingsGhoInfoCardsProps) => {
  const theme = useTheme();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const apr = meritIncentives?.incentiveAPR || '0';
  const aprFormatted = (+apr * 100).toFixed(2);

  const InfoCard = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
    <Paper
      sx={{
        p: 3,
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        mb: 2,
      }}
    >
      <Typography variant="subheader2" color="text.secondary" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  return (
    <Stack spacing={2}>
      {/* APR Card */}
      <InfoCard title={<Trans>Current APR</Trans>}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            {loading || !meritIncentives ? (
              <Skeleton variant="text" width={80} height={32} />
            ) : (
              <Typography variant="h4" color="primary">
                {aprFormatted}%
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              <Trans>Annual Percentage Rate</Trans>
            </Typography>
          </Box>
          <MeritIncentivesButton symbol="GHO" market={currentMarketData.market} />
        </Box>
      </InfoCard>

      {/* Total Deposited Card */}
      <InfoCard title={<Trans>Total Deposited</Trans>}>
        {loading || !stakeData ? (
          <Skeleton variant="text" width={120} height={32} />
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TokenIcon symbol="sgho" sx={{ width: 20, height: 20, mr: 1 }} />
              <FormattedNumber value={stakeData.totalSupplyFormatted} variant="h5" compact />
            </Box>
            <Typography variant="caption" color="text.secondary">
              <FormattedNumber
                value={stakeData.totalSupplyUSDFormatted}
                symbol="USD"
                visibleDecimals={2}
              />
            </Typography>
          </Box>
        )}
      </InfoCard>

      {/* Benefits Card */}
      <InfoCard title={<Trans>Benefits</Trans>}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00D395',
                mr: 2,
              }}
            />
            <Typography variant="description">
              <Trans>No slashing risk</Trans>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00D395',
                mr: 2,
              }}
            />
            <Typography variant="description">
              <Trans>Instant withdrawals</Trans>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00D395',
                mr: 2,
              }}
            />
            <Typography variant="description">
              <Trans>Competitive rewards</Trans>
            </Typography>
          </Box>
        </Stack>
      </InfoCard>

      {/* How it Works Card */}
      <InfoCard title={<Trans>How it Works</Trans>}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subheader2" sx={{ mb: 1 }}>
              <Trans>1. Deposit GHO</Trans>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Trans>Deposit your GHO tokens to start earning rewards</Trans>
            </Typography>
          </Box>
          <Box>
            <Typography variant="subheader2" sx={{ mb: 1 }}>
              <Trans>2. Earn Rewards</Trans>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Trans>Automatically earn APR on your deposited GHO</Trans>
            </Typography>
          </Box>
          <Box>
            <Typography variant="subheader2" sx={{ mb: 1 }}>
              <Trans>3. Withdraw Anytime</Trans>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Trans>Withdraw your GHO plus rewards instantly</Trans>
            </Typography>
          </Box>
        </Stack>
      </InfoCard>
    </Stack>
  );
};
