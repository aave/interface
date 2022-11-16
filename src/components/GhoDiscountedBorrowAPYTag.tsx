import { Box } from '@mui/material';

import { FormattedNumber } from './primitives/FormattedNumber';

export const GhoDiscountedBorrowAPYTag = ({ rate }: { rate: number }) => {
  return (
    <Box>
      <Box
        sx={{
          color: '#fff',
          borderRadius: '4px',
          height: '20px',
          display: 'flex',
          my: 0.5,
          p: 1,
          background: (theme) => theme.palette.gradients.aaveGradient,
        }}
      >
        <FormattedNumber
          compact
          percent
          value={rate * -1}
          visibleDecimals={0}
          variant="main12"
          symbolsColor="white"
        />
      </Box>
    </Box>
  );
};
