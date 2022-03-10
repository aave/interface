import { CheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';

import { ApprovalInfoContent } from '../../infoModalContents/ApprovalInfoContent';
import { RetryWithApprovalInfoContent } from '../../infoModalContents/RetryWithApprovalInfoContent';
import { TextWithModal } from '../../TextWithModal';

export type LeftHelperTextProps = {
  error?: string;
  approvalHash?: string;
  amount?: string;
};

export const LeftHelperText = ({ error, approvalHash, amount }: LeftHelperTextProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {approvalHash && (
        <>
          <CheckIcon
            style={{
              width: '12px',
              height: '12px',
              color: theme.palette.success.dark,
              marginLeft: '2px',
            }}
          />
          <Typography variant="helperText" color="success.dark">
            <Trans>Approve confirmed</Trans>
          </Typography>
        </>
      )}

      {error && (
        <TextWithModal
          text={<Trans>Retry What?</Trans>}
          iconSize={13}
          iconColor={theme.palette.text.secondary}
          withContentButton
          variant="helperText"
          color="text.secondary"
        >
          <RetryWithApprovalInfoContent />
        </TextWithModal>
      )}

      {!approvalHash && !error && amount && (
        <TextWithModal
          text={<Trans>Why do I need to approve?</Trans>}
          iconSize={13}
          iconColor={theme.palette.text.secondary}
          withContentButton
          variant="helperText"
          color="text.secondary"
        >
          <ApprovalInfoContent />
        </TextWithModal>
      )}
    </Box>
  );
};
