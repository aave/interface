import { Box } from '@mui/material';

import { HEX_TEXT } from '../../utils/tokenHex';

const SNIPPET_SX = {
  ...HEX_TEXT,
  flex: '1 1 18rem',
  m: 0,
  p: '1rem',
  borderRadius: '0.5rem',
  bgcolor: 'bg-4',
  color: 'fg-2',
  fontSize: '0.75rem',
  lineHeight: 1.6,
  overflowX: 'auto',
} as const;

export const CodeSnippet = ({ children }: { children: string }) => (
  <Box component="pre" sx={SNIPPET_SX}>
    {children}
  </Box>
);
