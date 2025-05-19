import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ExtendedReserveIncentiveResponse } from 'src/hooks/useZkSyncIgniteIncentives';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

export const ZkSyncIgniteIncentivesTooltipContent = ({
  zkSyncIgniteIncentives,
}: {
  zkSyncIgniteIncentives: ExtendedReserveIncentiveResponse;
}) => {
  const typographyVariant = 'secondary12';

  const zkSyncIgniteIncentivesFormatted = getSymbolMap(zkSyncIgniteIncentives);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column',
      }}
    >
      <img src={`/icons/other/zksync-ignite.svg`} width="100px" height="40px" alt="" />

      <Typography variant="caption" color="text.primary" mb={3}>
        <Trans>Eligible for the ZKSync Ignite program.</Trans>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>
          This is a program initiated and implemented by the decentralised ZKSync community. Aave
          Labs does not guarantee the program and accepts no liability.
        </Trans>{' '}
        <Link
          href={'https://zksyncignite.xyz/'}
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>ZKSync Ignite Program rewards are claimed through the</Trans>{' '}
        <Link
          href="https://app.zksyncignite.xyz/users/"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          official app
        </Link>
        {'.'}
      </Typography>
      {zkSyncIgniteIncentives.customMessage ? (
        <Typography variant="caption" color="text.strong" mb={3}>
          <Trans>{zkSyncIgniteIncentives.customMessage}</Trans>
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
                aToken={zkSyncIgniteIncentivesFormatted.aToken}
                symbol={zkSyncIgniteIncentivesFormatted.tokenIconSymbol}
                sx={{ fontSize: '20px', mr: 1 }}
              />
              <Typography variant={typographyVariant}>
                {zkSyncIgniteIncentivesFormatted.symbol}
              </Typography>
            </Box>
          }
          width="100%"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <FormattedNumber
              value={+zkSyncIgniteIncentivesFormatted.incentiveAPR}
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
