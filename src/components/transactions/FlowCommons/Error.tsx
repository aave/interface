import { DuplicateIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { TxErrorType } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TxResultActions } from './TxResultActions';
import { TxStatusHeader } from './TxStatusHeader';

export const TxErrorView = ({ txError }: { txError: TxErrorType }) => {
  const { close } = useModalContext();
  const [setFeedbackOpen, setSupportPrefillMessage] = useRootStore(
    useShallow((state) => [state.setFeedbackOpen, state.setSupportPrefillMessage])
  );

  const handleGetSupport = () => {
    const rawMessage = txError?.rawError?.message
      ? txError.rawError.message.toString()
      : 'Unknown error';
    const template = `I am coming from a transaction failure with this error:\n\n"${rawMessage}"`;

    setSupportPrefillMessage(template);
    setFeedbackOpen(true);
    close();
  };

  return (
    <>
      <TxStatusHeader
        status="error"
        title={<Trans>Transaction Failed</Trans>}
        description={<Trans>We were unable to complete this transaction</Trans>}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="tertiary" onClick={handleGetSupport} size="small">
          <Trans>Get support</Trans>
        </Button>
        <Button
          variant="tertiary"
          onClick={() =>
            navigator.clipboard.writeText(
              txError?.rawError?.message ? txError.rawError.message.toString() : 'Unknown error'
            )
          }
          size="small"
        >
          <Trans>Copy error text</Trans>

          <SvgIcon sx={{ ml: 0.5, fontSize: '12px' }}>
            <DuplicateIcon />
          </SvgIcon>
        </Button>
      </Box>
      <TxResultActions closeLabel={<Trans>Close</Trans>} onClose={close} />
    </>
  );
};
