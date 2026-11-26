import { Box, Typography } from '@mui/material';
import { Fragment } from 'react';

import { HEX_TEXT } from '../../utils/tokenHex';

export interface PropRow {
  name: string;
  type: string;
  scope?: string;
  description: string;
}

const CELL = { py: 2, borderBottom: '1px solid', borderColor: 'border-0' } as const;

export const PropsTable = ({ rows }: { rows: PropRow[] }) => {
  const scoped = rows.some((row) => row.scope);
  const headers = scoped ? ['Prop', 'Type', 'For', 'Description'] : ['Prop', 'Type', 'Description'];

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${headers.length - 1}, max-content) minmax(16rem, 1fr)`,
        columnGap: '1.5rem',
      }}
    >
      {headers.map((header) => (
        <Typography key={header} variant="caption" color="fg-3" sx={{ ...CELL, pt: 0 }}>
          {header}
        </Typography>
      ))}
      {rows.map((row) => (
        <Fragment key={row.name}>
          <Typography variant="caption" color="fg-1" sx={{ ...CELL, ...HEX_TEXT }}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="fg-3" sx={{ ...CELL, ...HEX_TEXT }}>
            {row.type}
          </Typography>
          {scoped && (
            <Typography variant="caption" color="fg-3" sx={CELL}>
              {row.scope}
            </Typography>
          )}
          <Typography variant="caption" color="fg-2" sx={CELL}>
            {row.description}
          </Typography>
        </Fragment>
      ))}
    </Box>
  );
};
