import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export type ToggleApprovePermitProps = {
  useApproval: boolean;
  setUseApproval: (permit: boolean) => void;
};

export const ToggleApprovePermit = ({ useApproval, setUseApproval }: ToggleApprovePermitProps) => {
  return (
    <>
      {!useApproval ? (
        <Typography
          variant="helperText"
          onClick={() => setUseApproval(true)}
          sx={{ cursor: 'pointer' }}
        >
          <Trans>Use approval instead</Trans>
        </Typography>
      ) : (
        <Typography
          variant="helperText"
          onClick={() => setUseApproval(false)}
          sx={{ cursor: 'pointer' }}
        >
          <Trans>Use permit instead</Trans>
        </Typography>
      )}
    </>
  );
};
