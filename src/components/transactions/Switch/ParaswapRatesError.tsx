import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { convertParaswapErrorMessage } from 'src/hooks/paraswap/common';

interface ParaswapRatesErrorProps {
  error: unknown;
}

export const ParaswapRatesError = ({ error }: ParaswapRatesErrorProps) => {
  return (
    <Warning severity="error" icon={false} sx={{ mt: 4 }}>
      <Typography variant="caption">
        {error instanceof Error
          ? convertParaswapErrorMessage(error.message)
          : 'There was an issue fetching data from Paraswap'}
      </Typography>
    </Warning>
  );
};
