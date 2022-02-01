import { CheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ApprovalInfoContent } from '../infoModalContents/ApprovalInfoContent';
import { RetryWithApprovalInfoContent } from '../infoModalContents/RetryWithApprovalInfoContent';
import { TextWithModal } from '../TextWithModal';

export type LeftHelperTextProps = {
  error?: string;
  approvalHash?: string;
  actionHash?: string;
  amount: string;
  requiresApproval: boolean;
};

export const LeftHelperText = ({
  error,
  approvalHash,
  actionHash,
  amount,
  requiresApproval,
}: LeftHelperTextProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      {approvalHash && !actionHash && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Box sx={{ width: '8.39px', height: '6px', color: 'green' }}>
            <CheckIcon />
          </Box>
          <Typography variant="helperText" color="#318435">
            <Trans>Approve confirmed</Trans>
          </Typography>
        </Box>
      )}
      {error && (
        <TextWithModal
          text={<Trans>Retry What?</Trans>}
          iconSize={13}
          iconColor="#FFFFFF3B"
          withContentButton
        >
          <RetryWithApprovalInfoContent />
        </TextWithModal>
      )}
      {!approvalHash && !error && !actionHash && Number(amount) > 0 && requiresApproval && (
        <TextWithModal
          text={<Trans>Why do I need to approve</Trans>}
          iconSize={13}
          iconColor="#FFFFFF3B"
          withContentButton
        >
          <ApprovalInfoContent />
        </TextWithModal>
      )}
    </Box>
  );
};
