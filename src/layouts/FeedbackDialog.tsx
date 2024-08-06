import { XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, SvgIcon, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { Link } from 'src/components/primitives/Link';
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
  const [email, setEmail] = useState('');

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
      email: email,
    };

    try {
      await fetch(url, {
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess(true);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
      setValue('');
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
          height: 'auto',
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

              <Typography variant="subheader1" sx={{ mt: 2 }}>
                <Trans>
                  Submission did not work, please try again later or contact wecare@avara.xyz
                </Trans>
              </Typography>
            </Box>
          </div>
        ) : (
          <Box width={'100%'}>
            <Typography variant="h3" display="flex" justifyContent="flex-start">
              <Trans>Feedback </Trans>
            </Typography>

            <Typography
              variant="subheader1"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 2, mt: 4 }}
            >
              <Trans>
                Let us know how we can make the app better for you. For user support related
                inquiries please reach out on
              </Trans>{' '}
              <Link
                target="_blank"
                variant="subheader1"
                color="text.secondary"
                href="https://discord.com/invite/aave"
                underline="always"
              >
                discord
              </Link>
              {'.'}
            </Typography>
            <Box width={'100%'}>
              <form style={{ width: '100%' }} onSubmit={handleFeedbackSubmit}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography color="text.secondary">
                    <Trans>Email</Trans>
                  </Typography>
                </Box>

                <TextField
                  // label="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography color="text.secondary">
                    <Trans>Feedback</Trans>
                  </Typography>
                </Box>
                <TextField
                  multiline
                  rows={4}
                  placeholder="Can you add this new feature"
                  fullWidth
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  sx={{
                    '& .MuiInputBase-inputMultiline': {
                      overflow: 'auto !important',
                      padding: '8px !important',
                    },
                    '& .MuiOutlinedInput-root': {
                      padding: '0 !important',
                    },
                  }}
                />
                <Box display="flex" flexDirection={'row-reverse'} mt={3}>
                  <Button disabled={!value} variant="contained" type="submit">
                    <Trans>Send Feedback</Trans>
                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        )}
      </Box>
    </BasicModal>
  );
};
