import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
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

  useEffect(() => {
    if (feedbackDialogOpen) {
      setSuccess(false);
    }
  }, [feedbackDialogOpen]);

  const handleFeedbackSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) {
      return alert('Please add feedback');
    }

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

      return alert('Submission did not work, please try again later or contact wecare@avara.xyz');
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
                  <Button variant="contained" type="submit">
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
