import { valueToBigNumber } from '@aave/math-utils';
import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { TokenIcon } from '../primitives/TokenIcon';
import { IncentivesInfoModal } from './IncentivesInfoModal';

interface IncentivesButtonProps {
  symbol: string;
  incentives?: ReserveIncentiveResponse[];
}

export const IncentivesButton = ({ incentives, symbol }: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false);

  if (!(incentives && incentives.length > 0)) return null;

  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === 'Infinity'
  );
  const incentivesAPRSum = isIncentivesInfinity
    ? 'Infinity'
    : incentives.reduce((aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR, 0);

  const incentivesNetAPR = isIncentivesInfinity
    ? 'Infinity'
    : incentivesAPRSum !== 'Infinity'
    ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
    : 'Infinity';

  if (incentivesNetAPR === 0) return null;

  const incentivesButtonValue = () => {
    if (incentivesNetAPR !== 'Infinity' && incentivesNetAPR < 10000) {
      return (
        <FormattedNumber value={incentivesNetAPR} percent variant="main12" color="text.secondary" />
      );
    } else if (incentivesNetAPR !== 'Infinity' && incentivesNetAPR > 9999) {
      return (
        <FormattedNumber
          value={incentivesNetAPR}
          percent
          compact
          variant="main12"
          color="text.secondary"
        />
      );
    } else if (incentivesNetAPR === 'Infinity') {
      return (
        <Typography variant="main12" color="text.secondary">
          ∞
        </Typography>
      );
    }
  };

  const iconSize = 12;

  return (
    <>
      <Box
        sx={(theme) => ({
          p: { xxs: '0 4px', xs: '2px 4px' },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s ease',
          '&:hover': {
            opacity: 0.6,
          },
        })}
        onClick={() => setOpen(true)}
      >
        <Box sx={{ mr: 2 }}>{incentivesButtonValue()}</Box>

        <Box sx={{ display: 'inline-flex' }}>
          <>
            {incentives.length < 5 ? (
              <>
                {incentives.map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
              </>
            ) : (
              <>
                {incentives.slice(0, 3).map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
                <SvgIcon
                  sx={{
                    fontSize: `${iconSize}px`,
                    borderRadius: '50%',
                    bgcolor: 'common.white',
                    color: 'common.black',
                    ml: -1,
                    zIndex: 5,
                  }}
                >
                  <DotsHorizontalIcon />
                </SvgIcon>
              </>
            )}
          </>
        </Box>
      </Box>

      {open && (
        <IncentivesInfoModal
          open={open}
          setOpen={setOpen}
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
        />
      )}
    </>
  );
};
