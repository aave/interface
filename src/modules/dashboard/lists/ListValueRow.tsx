import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { Row } from '../../../components/primitives/Row';

interface ListValueRowProps {
  title: ReactNode;
  capsComponent?: ReactNode;
  value: string | number;
  subValue: string | number;
  disabled?: boolean;
}

export const ListValueRow = ({
  title,
  capsComponent,
  value,
  subValue,
  disabled,
}: ListValueRowProps) => {
  return (
    <Row caption={title} captionVariant="description" mb={2}>
      {/* Amount and its USD equivalent sit side by side rather than stacked, so every row of a
          mobile card is a single line. Baseline-aligned, because the two variants have
          different leading (h5 18px vs description 20px) and centring leaves them a pixel off.
          The inner Box keeps the caps hint bound to the amount at its own 4px inset instead of
          picking up the 8px gap. */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedNumber value={value} variant="h5" color={disabled ? 'fg-4' : 'fg-1'} />
          {capsComponent}
        </Box>

        {!disabled && (
          <FormattedNumber value={subValue} variant="description" color="fg-2" symbol="USD" />
        )}
      </Box>
    </Row>
  );
};
