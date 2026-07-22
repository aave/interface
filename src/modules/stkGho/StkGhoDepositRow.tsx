import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';

interface StkGhoDepositRowProps {
  availableToStake: string;
  onDeposit?: () => void;
  onMigrate?: () => void;
  hasLegacyPosition?: boolean;
  stakedToken: string;
  totalDepositedUSD: string;
}

export const StkGhoDepositRow = ({
  availableToStake,
  onDeposit,
  onMigrate,
  hasLegacyPosition = false,
  stakedToken,
  totalDepositedUSD,
}: StkGhoDepositRowProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const { openSwitch } = useModalContext();
  const { chainId: targetChainId } = useSavingsMarketData();

  const apr = 0;

  const hasGho = +availableToStake > 0;

  // When the user holds a legacy position, migration is the primary action:
  // invert the emphasis so Migrate is contained and Deposit/Get GHO is outlined.
  const depositVariant = hasLegacyPosition ? 'outlined' : 'contained';
  const migrateVariant = hasLegacyPosition ? 'contained' : 'outlined';

  const handleGetGho = () => {
    openSwitch('', targetChainId);
  };

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: { xs: 'stretch', xsm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', xsm: 'row' },
        gap: { xs: 4, xsm: 4 },
        borderRadius: { xs: '8px', xsm: '6px' },
        border: `1px solid ${theme.palette.divider}`,
        p: 4,
        mb: 6,
        background: theme.palette.background.paper,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <TokenIcon symbol="stkgho" sx={{ width: 36, height: 36 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subheader1" sx={{ lineHeight: 1.25 }}>
            stkGHO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              <Trans>Available to deposit:</Trans>
            </Typography>
            <FormattedNumber
              value={availableToStake}
              variant="caption"
              color="text.secondary"
              visibleDecimals={2}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between', xsm: 'flex-end' },
          gap: { xs: 4, xsm: 4 },
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 4, xsm: 4 } }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              <Trans>Total Deposited</Trans>
            </Typography>
            <FormattedNumber
              value={totalDepositedUSD}
              variant="main16"
              symbol="USD"
              visibleDecimals={2}
            />
          </Box>

          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              <Trans>APR</Trans>
            </Typography>
            <FormattedNumber value={apr} percent variant="main16" visibleDecimals={2} />
          </Box>
        </Box>

        {hasGho ? (
          <Button
            variant={depositVariant}
            onClick={onDeposit}
            fullWidth={!xsm}
            sx={{ minWidth: { xs: '140px', xsm: '96px' }, height: '36px' }}
            data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
          >
            <Trans>Deposit</Trans>
          </Button>
        ) : (
          <Button
            variant={depositVariant}
            onClick={handleGetGho}
            fullWidth={!xsm}
            sx={{ minWidth: { xs: '140px', xsm: '96px' }, height: '36px' }}
            data-cy={`stakeBtn_${stakedToken.toUpperCase()}`}
          >
            <Trans>Get GHO</Trans>
          </Button>
        )}

        <Button
          variant={migrateVariant}
          onClick={onMigrate}
          disabled={!hasLegacyPosition}
          fullWidth={!xsm}
          sx={{ minWidth: { xs: '140px', xsm: '96px' }, height: '36px' }}
          data-cy={`migrateBtn_${stakedToken.toUpperCase()}`}
        >
          <Trans>Migrate</Trans>
        </Button>
      </Box>
    </Box>
  );
};
