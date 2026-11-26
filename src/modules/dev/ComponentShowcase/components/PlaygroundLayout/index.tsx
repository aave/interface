import { Box } from '@mui/material';
import { ReactNode, useState } from 'react';

import { CodeSnippet } from '../CodeSnippet';

const ROOT_SX = { display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' } as const;

const CONTROLS_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '1rem 2rem',
} as const;

const STAGE_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '1.5rem',
} as const;

export const usePlaygroundOptions = <T extends object>(initial: T) => {
  const [options, setOptions] = useState(initial);
  const set =
    <K extends keyof T>(key: K) =>
    (value: T[K]) =>
      setOptions((current) => ({ ...current, [key]: value }));

  return [options, set] as const;
};

export const PlaygroundLayout = ({
  controls,
  width,
  snippet,
  children,
}: {
  controls?: ReactNode;
  width: string;
  snippet: string;
  children: ReactNode;
}) => (
  <Box sx={ROOT_SX}>
    {controls ? <Box sx={CONTROLS_SX}>{controls}</Box> : null}
    <Box sx={STAGE_SX}>
      <Box sx={{ flex: `1 1 ${width}`, maxWidth: width, minWidth: 0 }}>{children}</Box>
      <CodeSnippet>{snippet}</CodeSnippet>
    </Box>
  </Box>
);
