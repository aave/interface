import { DuplicateIcon, XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { TxErrorType } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mb: '92px',
        }}
      >
        <Box
          sx={{
            width: '48px',
            height: '48px',
            backgroundColor: 'error.200',
            borderRadius: '50%',
            mt: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ color: 'error.main', fontSize: '32px' }}>
            <XIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 2 }} variant="h2">
          <Trans>Transaction failed</Trans>
        </Typography>

        <Typography>
          <Trans>
            You can report incident to our{' '}
            <Link href="https://discord.com/invite/aave">Discord</Link> or
            <Link href="https://github.com/aave/interface">Github</Link>.
          </Trans>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 6 }}>
          <Button variant="outlined" onClick={handleGetSupport} size="small">
            <Trans>Get support</Trans>
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            size="small"
          >
            <Trans>Copy error text</Trans>

            <SvgIcon sx={{ ml: 0.5, fontSize: '12px' }}>
              <DuplicateIcon />
            </SvgIcon>
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12 }}>
        <Button onClick={close} variant="contained" size="large" sx={{ minHeight: '44px' }}>
          <Trans>Close</Trans>
        </Button>
      </Box>
    </>
  );
};
