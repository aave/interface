import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';

const ROOT_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.375rem',
  height: '100%',
} as const;

const TITLE_SX = { fontSize: '1rem', fontWeight: 500, lineHeight: '1.125rem', pr: '2rem' } as const;

export const SelectModal = ({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
}) => (
  <BasicModal open={open} setOpen={setOpen} contentMaxWidth={480} contentHeight={640}>
    <Box sx={ROOT_SX}>
      <Typography variant="inherit" component="h2" color="fg-1" sx={TITLE_SX}>
        {title}
      </Typography>
      {children}
    </Box>
  </BasicModal>
);
