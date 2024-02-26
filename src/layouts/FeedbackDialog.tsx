import { XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, SvgIcon, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { BaseSuccessView } from 'src/components/transactions/FlowCommons/BaseSuccess';
import { useRootStore } from 'src/store/root';

export const FeedbackModal = () => {
  const [feedbackDialogOpen, setFeedbackOpen] = useRootStore((state) => [
    state.feedbackDialogOpen,
    state.setFeedbackOpen,
  ]);

  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (feedbackDialogOpen) {
      setSuccess(false);
      setError(false);
    }
  }, [feedbackDialogOpen]);

  const handleFeedbackSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const url = process.env.NEXT_PUBLIC_API_BASEURL + '/feedback';

    const payload = {
      text: value,
    };

    try {
      await fetch(url, {
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setIsLoading(false);
      setSuccess(true);
      setValue('');
    } catch (error) {
      setIsLoading(false);
      setValue('');
      setError(true);
    }
  };

  return (
    <BasicModal open={feedbackDialogOpen} setOpen={setFeedbackOpen}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : success ? (
          <BaseSuccessView hideTx={true}>
            <Box display="flex" justifyContent={'center'} mt={3}>
              <Trans>Thank you for submitting feedback!</Trans>
            </Box>
          </BaseSuccessView>
        ) : error ? (
          <div>
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

              <Typography sx={{ mt: 8 }} variant="h4">
                <Trans>
                  Submission did not work, please try again later or contact wecare@avara.xyz
                </Trans>
              </Typography>
            </Box>
          </div>
        ) : (
          <>
            <Typography variant="h2">
              <Trans>Provide App Feedback </Trans>
            </Typography>

            <Typography variant="description" sx={{ textAlign: 'center', mb: 2, mt: 2 }}>
              <Trans>Let us know how we can make the app better for you</Trans>
              {'.'}
            </Typography>
            <Box width={'100%'}>
              <form onSubmit={handleFeedbackSubmit}>
                <TextField
                  multiline
                  rows={6}
                  placeholder="Can you add this new feature"
                  fullWidth
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <Box display="flex" flexDirection={'row-reverse'} mt={3}>
                  <Button disabled={!value} variant="contained" type="submit">
                    <Trans>Send Feedback</Trans>
                  </Button>
                </Box>
              </form>
            </Box>
          </>
        )}
      </Box>
    </BasicModal>
  );
};
