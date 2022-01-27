import { Box, Typography } from '@mui/material';

import { ReserveIncentiveResponse } from '../../hooks/app-data-provider/useIncentiveData';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import { TokenIcon } from '../primitives/TokenIcon';
import { IncentivesButton, IncentivesButtonWrapper } from './IncentivesButton';

interface IncentivesCardProps {
  symbol: string;
  value: string | number;
  incentives?: ReserveIncentiveResponse[];
}

export const IncentivesCard = ({ symbol, value, incentives }: IncentivesCardProps) => {
  const isFeiReward = symbol === 'FEI';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {value.toString() !== '-1' ? (
        <FormattedNumber value={value} percent variant="main14" />
      ) : (
        <NoData variant="main14" />
      )}

      {isFeiReward ? (
        <IncentivesButtonWrapper symbol={symbol}>
          <Box sx={{ mr: 2 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <TokenIcon symbol="TRIBE" sx={{ fontSize: `12px` }} />
              <Typography
                variant="main12"
                color="text.secondary"
                sx={{ ml: 1, lineHeight: '13px' }}
              >
                TRIBE
              </Typography>
            </Box>
          </Box>

          <Box>Fei modal</Box>
        </IncentivesButtonWrapper>
      ) : (
        <IncentivesButton incentives={incentives} symbol={symbol} />
      )}
    </Box>
  );
};
