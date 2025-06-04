import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useRootStore } from 'src/store/root';

export const SavingsGhoTopPanel = () => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data: stakeGeneralResult, isLoading: stakeDataLoading } = useGeneralStakeUiData(
    currentMarketData,
    Stake.gho
  );

  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: currentMarketData.market,
  });

  const stakeData = stakeGeneralResult?.[0];
  const apr = meritIncentives?.incentiveAPR || '0';
  const aprFormatted = (+apr * 100).toFixed(2);

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TokenIcon symbol="sgho" sx={{ width: 32, height: 32, mr: 2 }} />
            <Typography variant="h1" sx={{ color: '#F1F1F3' }}>
              <Trans>Savings GHO</Trans>
            </Typography>
          </Box>
          <Typography variant="description" sx={{ color: '#A5A8B6', maxWidth: '600px' }}>
            <Trans>
              Stake GHO is now Savings GHO. With no risk of slashing and immediate withdraws
              available, earn up to {aprFormatted}% APR on your GHO holdings.
            </Trans>
          </Typography>
        </Box>
      }
    >
      <TopInfoPanelItem hideIcon title={<Trans>Current APR</Trans>} loading={!meritIncentives}>
        <FormattedNumber
          value={aprFormatted}
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          percent
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Total Deposited</Trans>} loading={stakeDataLoading}>
        {stakeData ? (
          <Box>
            <FormattedNumber
              value={stakeData.totalSupplyFormatted}
              variant={valueTypographyVariant}
              symbolsVariant={symbolsTypographyVariant}
              symbolsColor="#A5A8B6"
              compact
            />
            <Typography variant="caption" sx={{ color: '#A5A8B6', display: 'block' }}>
              <FormattedNumber
                value={stakeData.totalSupplyUSDFormatted}
                symbol="USD"
                visibleDecimals={2}
              />
            </Typography>
          </Box>
        ) : (
          <Typography variant={valueTypographyVariant} sx={{ color: '#A5A8B6' }}>
            -
          </Typography>
        )}
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Withdrawal Period</Trans>} loading={false}>
        <Typography variant={valueTypographyVariant} sx={{ color: '#A5A8B6' }}>
          <Trans>Instant</Trans>
        </Typography>
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Risk Level</Trans>} loading={false}>
        <Typography variant={valueTypographyVariant} sx={{ color: '#00D395' }}>
          <Trans>No Slashing</Trans>
        </Typography>
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
