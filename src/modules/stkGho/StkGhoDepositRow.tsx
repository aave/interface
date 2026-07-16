import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { IncentivesIcon } from 'src/components/incentives/IncentivesButton';
import { MeritIncentivesTooltipContent } from 'src/components/incentives/MeritIncentivesTooltipContent';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { CustomMarket } from 'src/ui-config/marketsConfig';

interface StkGhoDepositRowProps {
  availableToStake: string;
  onDeposit?: () => void;
  onMigrate?: () => void;
  hasLegacyPosition?: boolean;
  stakedToken: string;
}

export const StkGhoDepositRow = ({
  availableToStake,
  onDeposit,
  onMigrate,
  hasLegacyPosition = false,
  stakedToken,
}: StkGhoDepositRowProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const { openSwitch } = useModalContext();
  const { chainId: targetChainId } = useSavingsMarketData();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: CustomMarket.proto_mainnet_v3,
  });
  const apr = meritIncentives ? +meritIncentives.incentiveAPR : 0;

  const hasGho = +availableToStake > 0;

  // When the user holds a legacy position, migration is the primary action:
  // invert the emphasis so Migrate is contained and Deposit/Get GHO is outlined.
  const depositVariant = hasLegacyPosition ? 'outlined' : 'contained';
  const migrateVariant = hasLegacyPosition ? 'contained' : 'outlined';

  const handleGetGho = () => {
    openSwitch('', targetChainId);
  };

  const aprDisplay = (
    <Box
      sx={{
        textAlign: 'left',
        cursor: meritIncentives ? 'pointer' : 'default',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        <Trans>APR</Trans>
      </Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <FormattedNumber value={apr} percent variant="main16" visibleDecimals={2} />
        {meritIncentives && <IncentivesIcon width="16" height="16" />}
      </Box>
    </Box>
  );

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
          gap: { xs: 4, xsm: 3 },
          flexShrink: 0,
        }}
      >
        {meritIncentives ? (
          <ContentWithTooltip
            tooltipContent={
              <MeritIncentivesTooltipContent
                meritIncentives={meritIncentives}
                onClose={() => setTooltipOpen(false)}
              />
            }
            withoutHover
            setOpen={setTooltipOpen}
            open={tooltipOpen}
          >
            {aprDisplay}
          </ContentWithTooltip>
        ) : (
          aprDisplay
        )}

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
