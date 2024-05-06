import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';

export const MeritIncentivesTooltipContent = ({
  incentiveAPR,
  rewardTokenSymbol,
}: Omit<ReserveIncentiveResponse, 'rewardTokenAddress'>) => {
  const typographyVariant = 'secondary12';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column',
      }}
    >
      <Typography variant="caption" color="text.primary" mb={3}>
        <Trans>Eligible for the merit program.</Trans>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>
          This is a program initiated and implemented by the decentralised Aave community. Aave Labs
          does not guarantee the program and accepts no liability.
        </Trans>
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Row
          height={32}
          caption={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 0,
              }}
            >
              <TokenIcon symbol={rewardTokenSymbol} sx={{ fontSize: '20px', mr: 1 }} />
              <Typography variant={typographyVariant}>{rewardTokenSymbol}</Typography>
            </Box>
          }
          width="100%"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <FormattedNumber value={+incentiveAPR} percent variant={typographyVariant} />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </Box>
        </Row>
      </Box>
    </Box>
  );
};
