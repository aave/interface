import { Alert, AlertProps } from '@mui/material';

export const Warning = ({ children, ...rest }: AlertProps) => {
  return (
    <Alert sx={{ mb: 6, alignItems: 'center', width: '100%' }} {...rest}>
      {children}
    </Alert>
  );
};
