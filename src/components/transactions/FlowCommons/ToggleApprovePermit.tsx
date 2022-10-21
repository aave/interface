import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { TxStateType } from 'src/hooks/useModal';

export type ToggleApprovePermitProps = {
  tryPermit?: boolean;
  useApproval: boolean;
  setUseApproval: (permit: boolean) => void;
  approvalTxState?: TxStateType;
};

export const ToggleApprovePermit = ({
  tryPermit,
  useApproval,
  setUseApproval,
  approvalTxState,
}: ToggleApprovePermitProps) => {
  return (
    <>
      {tryPermit && !useApproval && !approvalTxState?.success ? (
        <Typography
          variant="helperText"
          onClick={() => setUseApproval(true)}
          sx={{ cursor: 'pointer' }}
        >
          <Trans>Use approval instead</Trans>
        </Typography>
      ) : (
        !approvalTxState?.txHash &&
        !approvalTxState?.success && (
          <Typography
            variant="helperText"
            onClick={() => setUseApproval(false)}
            sx={{ cursor: 'pointer' }}
          >
            <Trans>Use permit instead</Trans>
          </Typography>
        )
      )}
    </>
  );
};
