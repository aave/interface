import { CheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ApprovalInfoContent } from '../infoModalContents/ApprovalInfoContent';
import { RetryWithApprovalInfoContent } from '../infoModalContents/RetryWithApprovalInfoContent';
import { TextWithModal } from '../TextWithModal';

export type LeftHelperTextProps = {
  error: string | null;
  approvalHash: string | null;
  actionHash: string | null;
  amountToSupply: string;
};

export const LeftHelperText = ({
  error,
  approvalHash,
  actionHash,
  amountToSupply,
}: LeftHelperTextProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      {approvalHash && !actionHash && (
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
      {!approvalHash && !error && !actionHash && Number(amountToSupply) > 0 && (
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
