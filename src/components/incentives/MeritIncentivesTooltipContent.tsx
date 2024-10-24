import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ExtendedReserveIncentiveResponse } from 'src/hooks/useMeritIncentives';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

export const MeritIncentivesTooltipContent = ({
  meritIncentives,
}: {
  meritIncentives: ExtendedReserveIncentiveResponse;
}) => {
  const typographyVariant = 'secondary12';

  const meritIncentivesFormatted = getSymbolMap(meritIncentives);

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
        </Trans>{' '}
        <Link
          href="https://governance.aave.com/t/arfc-merit-a-new-aave-alignment-user-reward-system/16646"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Merit Program rewards are claimed through the</Trans>{' '}
        <Link
          href="https://apps.aavechan.com/merit"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Aave Chan Initiative interface
        </Link>
        {'.'}
      </Typography>
      {meritIncentives.customMessage ? (
        <Typography variant="caption" color="text.strong" mb={3}>
          <Trans>{meritIncentives.customMessage}</Trans>
        </Typography>
      ) : null}

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
              <TokenIcon
                aToken={meritIncentivesFormatted.aToken}
                symbol={meritIncentivesFormatted.tokenIconSymbol}
                sx={{ fontSize: '20px', mr: 1 }}
              />
              <Typography variant={typographyVariant}>{meritIncentivesFormatted.symbol}</Typography>
            </Box>
          }
          width="100%"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <FormattedNumber
              value={+meritIncentivesFormatted.incentiveAPR}
              percent
              variant={typographyVariant}
            />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </Box>
        </Row>
      </Box>
    </Box>
  );
};
