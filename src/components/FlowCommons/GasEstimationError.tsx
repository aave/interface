import { Trans } from '@lingui/macro';
import { Typography, Button } from '@mui/material';

export const GasEstimationError = ({ error }: { error: string }) => {
  return (
    <Typography color="red" variant="helperText">
      <Trans>There was some</Trans>
      <Button onClick={() => navigator.clipboard.writeText(error)}>error</Button>
      <Trans>. Please try changing the parameters</Trans>
    </Typography>
  );
};
