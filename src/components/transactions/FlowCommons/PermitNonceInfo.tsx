import { Trans } from '@lingui/macro';
import { Tooltip, Typography } from '@mui/material';

export const PermitNonceInfo = () => {
  return (
    <Tooltip
      title={
        <>
          <Trans>There is an active order for the same sell asset (avoid nonce reuse).</Trans>
        </>
      }
      placement="left"
      arrow
    >
      <Typography
        variant="helperText"
        color="text.secondary"
        sx={{
          cursor: 'help',
          mb: 1,
          textAlign: 'center',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Trans>Approval by signature not available</Trans>
      </Typography>
    </Tooltip>
  );
};
