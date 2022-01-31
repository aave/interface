import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';

import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { BasicModal } from '../primitives/BasicModal';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { Row } from '../primitives/Row';
import { TokenIcon } from '../primitives/TokenIcon';

interface IncentivesInfoModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  incentives: ReserveIncentiveResponse[];
  incentivesNetAPR: 'Infinity' | number;
  symbol: string;
}

export const IncentivesInfoModal = ({
  open,
  setOpen,
  incentives,
  incentivesNetAPR,
  symbol,
}: IncentivesInfoModalProps) => {
  const { currentMarketData } = useProtocolDataContext();

  const typographyVariant = 'secondary16';

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
    <BasicModal open={open} setOpen={setOpen}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            {currentMarketData.marketTitle} <Trans>rewards</Trans>
          </Typography>
          {/* TODO: need to add Trans */}
          <Typography>Participating in this {symbol} reserve gives annualized rewards.</Typography>
        </Box>

        <Box
          sx={(theme) => ({
            p: 5,
            borderRadius: '4px',
            border: `1px solid ${theme.palette.divider}`,
            width: '100%',
          })}
        >
          {incentives.length > 1 && (
            <Box sx={(theme) => ({ pb: 2, mb: 2, border: `1px solid ${theme.palette.divider}` })}>
              <Row caption={<Trans>Net APR</Trans>}>
                <Number incentiveAPR={incentivesNetAPR} />
              </Row>
            </Box>
          )}

          <>
            {incentives.map((incentive) => (
              <Row
                caption={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: incentives.length > 1 ? 2 : 0,
                    }}
                  >
                    <TokenIcon symbol={incentive.rewardTokenSymbol} />
                    <Typography sx={{ ml: 2 }} variant={typographyVariant}>
                      {incentive.rewardTokenSymbol}
                    </Typography>
                  </Box>
                }
                key={incentive.rewardTokenAddress}
              >
                <Number incentiveAPR={incentive.incentiveAPR} />
              </Row>
            ))}
          </>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
          <Button variant="contained" onClick={() => setOpen(false)}>
            <Trans>Ok, I got it</Trans>
          </Button>
        </Box>
      </Box>
    </BasicModal>
  );
};
