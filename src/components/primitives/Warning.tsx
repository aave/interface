import { Alert, AlertProps } from '@mui/material';

export const Warning = ({ children, ...rest }: AlertProps) => {
  return (
    <Alert sx={{ mb: 6 }} {...rest}>
      {children}
    </Alert>
  );
};
