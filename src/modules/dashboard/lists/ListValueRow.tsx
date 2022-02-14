import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { Row } from '../../../components/primitives/Row';

interface ListValueRowProps {
  title: ReactNode;
  capsComponent?: ReactNode;
  value: string | number;
  subValue: string | number;
}

export const ListValueRow = ({ title, capsComponent, value, subValue }: ListValueRowProps) => {
  return (
    <Row caption={title} captionVariant="description" align="flex-start" mb={2}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <FormattedNumber value={value} variant="secondary14" mb={0.5} />
        <FormattedNumber
          value={subValue}
          variant="secondary12"
          color="text.secondary"
          symbol="USD"
          mb={0.5}
        />
        {capsComponent}
      </Box>
    </Row>
  );
};
