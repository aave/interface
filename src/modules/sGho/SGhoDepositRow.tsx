import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { depositRowActionSx } from 'src/utils/buttonStyles';
import { figVars } from 'src/utils/figmaColors';

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
  const hasGho = +walletBalance > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', xsm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', xsm: 'row' },
        gap: 4,
        borderRadius: { xs: '8px', xsm: '6px' },
        border: `1px solid ${figVars['border-0']}`,
        p: 4,
        mb: 6,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <TokenIcon symbol="sgho" sx={{ width: 36, height: 36 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subheader1" sx={{ lineHeight: 1.25 }}>
            sGHO
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="fg-2">
              <Trans>Available to deposit:</Trans>
            </Typography>
            <FormattedNumber
              value={walletBalance}
              variant="caption"
              color="fg-2"
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
          <Typography variant="caption" color="fg-2" sx={{ display: 'block' }}>
            <Trans>Staking APR</Trans>
          </Typography>
          <FormattedNumber value={rate} percent variant="h4" visibleDecimals={2} />
        </Box>

        {hasGho ? (
          <Button
            variant="contained"
            onClick={onDeposit}
            sx={depositRowActionSx}
            data-cy="depositBtn_SGHO"
          >
            <Trans>Deposit</Trans>
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onGetGho}
            sx={depositRowActionSx}
            data-cy="getGhoBtn_SGHO"
          >
            <Trans>Get GHO</Trans>
          </Button>
        )}
      </Box>
    </Box>
  );
};
