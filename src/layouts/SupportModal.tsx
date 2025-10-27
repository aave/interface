import { XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { Link } from 'src/components/primitives/Link';
import { BaseSuccessView } from 'src/components/transactions/FlowCommons/BaseSuccess';
import { CONSENT_KEY } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { SUPPORT } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

export const SupportModal = () => {
  const [feedbackDialogOpen, setFeedbackOpen] = useRootStore(
    useShallow((state) => [state.feedbackDialogOpen, state.setFeedbackOpen])
  );
  const [account, trackEvent] = useRootStore(
    useShallow((store) => [store.account, store.trackEvent])
  );

  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dirtyEmailField, setDirtyEmailField] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(false);
  const [isShareWalletApproved, setIsShareWalletApproved] = useState(false);

  const onBlur = () => {
    if (!dirtyEmailField) setDirtyEmailField(true);
  };

  useEffect(() => {
    if (feedbackDialogOpen) {
      const optInStatus =
        typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) === 'true' : false;

      setHasOptedIn(optInStatus);
      setSuccess(false);
      setError(false);
      setEmailError('');
    }
  }, [feedbackDialogOpen]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSupportSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError || !email) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    const url = '/api/support-create-ticket';
    const payload = {
      text: value,
      email: email,
      walletAddress: (hasOptedIn || isShareWalletApproved) && account ? account : undefined,
    };

    try {
      const response = await fetch(url, {
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        setError(true);
        setIsLoading(false);
        setValue('');
        setEmail('');
        setIsShareWalletApproved(false);
        return;
      }
      setSuccess(true);
      trackEvent(SUPPORT.TICKET_CREATED, {
        type: 'Form',
        hasWalletConnected: !!account,
      });
    } catch (error) {
      setError(true);
      setIsShareWalletApproved(false);
    } finally {
      setIsLoading(false);
      setValue('');
      setEmail('');
      setIsShareWalletApproved(false);
    }
  };

  const onClose = () => {
    setFeedbackOpen(false);
    setEmailError('');
    setEmail('');
    setValue('');
    setIsShareWalletApproved(false);
    setDirtyEmailField(false);
    setSuccess(false);
    setError(false);
  };

  return (
    <BasicModal open={feedbackDialogOpen} setOpen={setFeedbackOpen} closeCallback={onClose}>
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
          <BaseSuccessView hideTx={true} onClose={onClose}>
            <Box display="flex" justifyContent={'center'} mt={3}>
              <Trans>Thank you for submitting your inquiry!</Trans>
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

              <Typography
                variant="subheader1"
                sx={{
                  mt: 6,
                  textAlign: 'center',
                  px: 2,
                }}
              >
                <Trans>
                  Submission did not work, please try again later or contact wecare@avara.xyz
                </Trans>
              </Typography>
            </Box>
          </div>
        ) : (
          <Box width={'100%'}>
            <Typography
              variant="h3"
              display="flex"
              justifyContent="flex-start"
              color="text.primary"
            >
              <Trans>Support</Trans>
            </Typography>

            <Typography
              variant="subheader1"
              color="text.primary"
              sx={{ textAlign: 'start', mb: 4, mt: 4 }}
            >
              <Trans>
                Let us know how we can help you. You may also consider joining our community
              </Trans>{' '}
              <Link
                target="_blank"
                variant="subheader1"
                color="text.primary"
                href="https://discord.gg/aave"
                underline="always"
              >
                Discord server
              </Link>
            </Typography>
            <Box width={'100%'}>
              <form style={{ width: '100%' }} onSubmit={handleSupportSubmit}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography color="text.secondary">
                    <Trans>Email</Trans>
                  </Typography>
                </Box>

                <TextField
                  // label="Email"
                  onBlur={onBlur}
                  placeholder="Please enter a valid email address here"
                  fullWidth
                  value={email}
                  onChange={handleEmailChange}
                  error={dirtyEmailField && !!emailError}
                  helperText={dirtyEmailField ? emailError : undefined}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': {
                      padding: '6px 8px',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography color="text.secondary">
                    <Trans>Inquiry</Trans>
                  </Typography>
                </Box>
                <TextField
                  multiline
                  rows={4}
                  placeholder="Please describe your issue here"
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

                {account && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1.5 }}>
                    {!hasOptedIn ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isShareWalletApproved}
                            onChange={(e) => setIsShareWalletApproved(e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography color="text.primary">
                              <Trans>
                                Share my wallet address to help the support team resolve my issue
                              </Trans>
                            </Typography>
                          </Box>
                        }
                      />
                    ) : (
                      ''
                    )}
                  </Box>
                )}
                <Box display="flex" flexDirection={'row-reverse'} mt={3}>
                  <Button disabled={!value || !!emailError} variant="contained" type="submit">
                    <Trans>Submit</Trans>
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
