import { Alert, AlertProps } from '@mui/material';

export const Warning = ({ children, sx, ...rest }: AlertProps) => {
  const styles = { mb: 6, alignItems: 'center', width: '100%', ...sx };

  return (
    <Alert sx={styles} {...rest}>
      {children}
    </Alert>
  );
};
