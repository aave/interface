import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box } from '@mui/material';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { NoData } from '../primitives/NoData';
import { IncentivesButton } from './IncentivesButton';

interface IncentivesCardProps {
  symbol: string;
  value: string | number;
  incentives?: ReserveIncentiveResponse[];
  variant?: 'main14' | 'main16' | 'secondary14';
  symbolsVariant?: 'secondary14' | 'secondary16';
  align?: 'center' | 'flex-end';
  color?: string;
}

export const IncentivesCard = ({
  symbol,
  value,
  incentives,
  variant = 'secondary14',
  symbolsVariant,
  align,
  color,
}: IncentivesCardProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align || { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {value.toString() !== '-1' ? (
        <FormattedNumber
          value={value}
          percent
          variant={variant}
          symbolsVariant={symbolsVariant}
          color={color}
          symbolsColor={color}
        />
      ) : (
        <NoData variant={variant} color={color || 'text.secondary'} />
      )}

      <IncentivesButton incentives={incentives} symbol={symbol} />
    </Box>
  );
};
