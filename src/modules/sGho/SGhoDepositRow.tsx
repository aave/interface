import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

interface SGhoDepositRowProps {
  walletBalance: string;
  rate: number;
  onDeposit?: () => void;
  onGetGho?: () => void;
}

export const SGhoDepositRow = ({
  walletBalance,
  rate,
  onDeposit,
  onGetGho,
}: SGhoDepositRowProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  const hasGho = +walletBalance > 0;

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: { xs: 'stretch', xsm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', xsm: 'row' },
        gap: 4,
        borderRadius: { xs: '8px', xsm: '6px' },
        border: `1px solid ${theme.palette.divider}`,
        p: 4,
        mb: 6,
        background: theme.palette.background.paper,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <TokenIcon symbol="sgho" sx={{ width: 36, height: 36 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subheader1" sx={{ lineHeight: 1.25 }}>
            sGHO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              <Trans>Available to deposit:</Trans>
            </Typography>
            <FormattedNumber
              value={walletBalance}
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
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <Trans>Staking APR</Trans>
          </Typography>
          <FormattedNumber value={rate} percent variant="main16" visibleDecimals={2} />
        </Box>

        {hasGho ? (
          <Button
            variant="contained"
            onClick={onDeposit}
            fullWidth={!xsm}
            sx={{ minWidth: { xs: '140px', xsm: '96px' }, height: '36px' }}
            data-cy="depositBtn_SGHO"
          >
            <Trans>Deposit</Trans>
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onGetGho}
            fullWidth={!xsm}
            sx={{ minWidth: { xs: '140px', xsm: '96px' }, height: '36px' }}
            data-cy="getGhoBtn_SGHO"
          >
            <Trans>Get GHO</Trans>
          </Button>
        )}
      </Box>
    </Box>
  );
};
