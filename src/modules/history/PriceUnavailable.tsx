import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

export const PriceUnavailable = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <FormattedNumber
        compact
        compactThreshold={100000}
        symbol="USD"
        symbolsColor="common.white"
        value={value}
      />
    );
  } else {
    return (
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Trans>
          Price data is not currently available for this reserve on the protocol subgraph
        </Trans>
      </Box>
    );
  }
};
