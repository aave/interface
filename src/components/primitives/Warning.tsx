import { Alert, AlertProps } from '@mui/material';

interface WarningProps extends AlertProps {}

export const Warning = ({ children, ...rest }: WarningProps) => {
  return (
    <Alert sx={{ mb: 6 }} {...rest}>
      {children}
    </Alert>
  );
};
