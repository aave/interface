import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';

interface IncentivesTooltipContentProps {
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: 'Infinity' | number;
  symbol: string;
}

export const IncentivesTooltipContent = ({
  incentives,
  incentivesNetAPR,
  symbol,
}: IncentivesTooltipContentProps) => {
  const typographyVariant = 'secondary12';

  const Number = ({ incentiveAPR }: { incentiveAPR: 'Infinity' | number | string }) => {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {incentiveAPR !== 'Infinity' ? (
          <>
            <FormattedNumber value={+incentiveAPR} percent variant={typographyVariant} />
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant={typographyVariant}>∞ %</Typography>
            <Typography variant={typographyVariant} sx={{ ml: 1 }}>
              <Trans>APR</Trans>
            </Typography>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="caption" color="text.secondary" mb={3}>
        <Trans>Participating in this {symbol} reserve gives annualized rewards.</Trans>
      </Typography>

      <Box sx={{ width: '100%' }}>
        {incentives.map((incentive) => (
          <Row
            height={32}
            caption={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: incentives.length > 1 ? 2 : 0,
                }}
              >
                <TokenIcon symbol={incentive.rewardTokenSymbol} sx={{ fontSize: '20px', mr: 1 }} />
                <Typography variant={typographyVariant}>{incentive.rewardTokenSymbol}</Typography>
              </Box>
            }
            key={incentive.rewardTokenAddress}
            width="100%"
          >
            <Number incentiveAPR={incentive.incentiveAPR} />
          </Row>
        ))}

        {incentives.length > 1 && (
          <Box sx={(theme) => ({ pt: 1, mt: 1, border: `1px solid ${theme.palette.divider}` })}>
            <Row caption={<Trans>Net APR</Trans>} height={32}>
              <Number incentiveAPR={incentivesNetAPR} />
            </Row>
          </Box>
        )}
      </Box>
    </Box>
  );
};
