import { Paper, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { Row } from 'src/components/primitives/Row';

import { ConfigRow, ConfigValueKey } from '../../../../utils/configRows';
import { ConfigLabel } from '../ConfigLabel';
import { ConfigValue } from '../ConfigValue';

interface ConfigCardProps {
  row: ConfigRow;
  fields: { key: ConfigValueKey; title: ReactNode }[];
}

export const ConfigCard = ({ row, fields }: ConfigCardProps) => (
  <Paper variant="table" sx={{ p: '1rem', borderRadius: '0.5rem' }}>
    <ConfigLabel label={row.label} isEMode={row.isEMode} />
    <Stack gap="0.625rem" sx={{ mt: '1rem' }}>
      {fields.map((field) => (
        <Row
          key={field.key}
          caption={field.title}
          captionVariant="description"
          captionColor="fg-3"
          captionSx={{ mr: 0 }}
          sx={{ gap: '1rem', minHeight: '1.25rem' }}
        >
          <ConfigValue row={row} columnKey={field.key} />
        </Row>
      ))}
    </Stack>
  </Paper>
);
