import { Box } from '@mui/material';

export enum WarningType {
  WARNING,
  INFO,
}

export type WarningProps = {
  children: React.ReactNode;
  type?: WarningType;
};

export const Warning = ({ type, children }: WarningProps) => {
  // TODO: change color depending on type
  return <Box sx={{ mb: '24px', backgroundColor: '#FEF5E8', color: 'black' }}>{children}</Box>;
};
