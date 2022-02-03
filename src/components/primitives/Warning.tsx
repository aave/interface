import { Box } from '@mui/material';

export type WarningProps = {
  children: React.ReactNode;
};

export const Warning = ({ children }: WarningProps) => {
  return <Box sx={{ mb: '24px', backgroundColor: '#FEF5E8', color: 'black' }}>{children}</Box>;
};
