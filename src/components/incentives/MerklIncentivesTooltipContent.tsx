import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import { ExtendedReserveIncentiveResponse } from 'src/hooks/useMerklIncentives';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

export const MerklIncentivesTooltipContent = ({
  merklIncentives,
}: {
  merklIncentives: ExtendedReserveIncentiveResponse;
}) => {
  const theme = useTheme();

  const typographyVariant = 'secondary12';

  const merklIncentivesFormatted = getSymbolMap(merklIncentives);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection: 'column',
      }}
    >
      <img
        src={
          theme.palette.mode === 'dark'
            ? `/icons/other/merkl-white.svg`
            : `/icons/other/merkl-black.svg`
        }
        width="100px"
        height="40px"
        alt=""
      />

      <Typography variant="caption" color="text.primary" mb={3}>
        <Trans>Eligible for incentives through Merkl.</Trans>
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>
          This is a program initiated by the Aave DAO and implemented by Merkl. Aave Labs does not
          guarantee the program and accepts no liability.
        </Trans>
      </Typography>

      <Typography variant="caption" color="text.strong" mb={3}>
        <Trans>Merkl rewards are claimed through the</Trans>{' '}
        <Link href="https://app.merkl.xyz/" sx={{ textDecoration: 'underline' }} variant="caption">
          official app
        </Link>
        {'.'}
        {merklIncentives.customClaimMessage ? (
          <>
            {' '}
            <Trans> {merklIncentives.customClaimMessage}</Trans>
          </>
        ) : null}
      </Typography>

      {merklIncentives.customMessage ? (
        <Typography variant="caption" color="text.strong" mb={3}>
          <Trans>{merklIncentives.customMessage}</Trans>{' '}
          <Link
            href={
              merklIncentives.customForumLink
                ? merklIncentives.customForumLink
                : 'https://governance.aave.com/t/arfc-set-aci-as-emission-manager-for-liquidity-mining-programs/17898'
            }
            sx={{ textDecoration: 'underline' }}
            variant="caption"
          >
            Learn more
          </Link>
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
                aToken={merklIncentivesFormatted.aToken}
                symbol={merklIncentivesFormatted.tokenIconSymbol}
                sx={{ fontSize: '20px', mr: 1 }}
              />
              <Typography variant={typographyVariant}>{merklIncentivesFormatted.symbol}</Typography>
            </Box>
          }
          width="100%"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <FormattedNumber
              value={+merklIncentivesFormatted.incentiveAPR}
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
