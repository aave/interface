import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Snackbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';
import { useTGEContext } from 'src/maneki/hooks/tge-data-provider/TGEDataProvider';
import { marketsData } from 'src/ui-config/marketsConfig';

const TGEMainContribution = () => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { provider, currentAccount } = useWeb3Context();
  const { userBalanceBNB, finalPAWPrice, contributedBNB, TGEStatus } = useTGEContext();
  const [contributionBNB, setContributionBNB] = React.useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarMessage, seSnackbarMessage] = React.useState<string>('');
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;

  const handleContribute = async () => {
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(EARLY_TOKEN_GENERATION_ADDR, EARLY_TOKEN_GENERATION_ABI, signer);
    try {
      const promise = await contract.deposit(currentAccount, '', {
        value: utils.parseEther(contributionBNB),
      });
      await promise.wait(1);
      seSnackbarMessage('Contribution Success!');
      setSnackbarOpen(true);
    } catch (error) {
      if (error.data.message === 'execution reverted: Sale has ended') {
        seSnackbarMessage('Sale has ended.');
        setSnackbarOpen(true);
      } else {
        seSnackbarMessage('Whoops! Something went wrong. >.<!!');
        setSnackbarOpen(true);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: '24px 12px',
        gap: downToSM ? '24px' : '32px',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: '600',
          fontSize: downToSM ? '26px' : '32px',
          lineHeight: '48px',
        }}
      >
        <Trans>Contribute PAW</Trans>
      </Typography>
      <Box>
        <Typography>
          <Trans>Contribution Amount</Trans>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #D9D9D9',
            borderRadius: '12px',
            px: '12px',
            mt: '11px',
            '&:hover': {
              borderColor: 'orange',
            },
          }}
        >
          <Image alt={`token image for BNB`} src={`/icons/tokens/bnb.svg`} width={24} height={24} />
          <CustomNumberInput
            disabled={TGEStatus !== 'Active' ? true : false}
            amountTo={contributionBNB}
            setAmountTo={setContributionBNB}
            tokenBalance={utils.formatUnits(userBalanceBNB, 18)}
            sx={{
              '& fieldset': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  border: 'none',
                  borderColor: 'orange',
                },
              },
            }}
            inputProps={{ style: { fontSize: '16px' } }}
          />
          <Typography sx={{ color: 'text.secondary' }}>BNB</Typography>
        </Box>
      </Box>
      <Box>
        <Typography>
          <Trans>Amount to Claim</Trans>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #D9D9D9',
            borderRadius: '12px',
            p: '0 12px',
            mt: '11px',
            '&:hover': {
              borderColor: 'orange',
            },
          }}
        >
          <Image alt={`token image for PAW`} src={`/icons/tokens/paw.svg`} width={24} height={24} />
          <CustomNumberInput
            amountTo={(
              Number(contributionBNB) / Number(utils.formatUnits(finalPAWPrice, 18))
            ).toString()}
            setAmountTo={setContributionBNB}
            tokenBalance={'99999999999'}
            sx={{
              '& fieldset': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  border: 'none',
                  borderColor: 'orange',
                },
              },
            }}
            inputProps={{ style: { fontSize: '16px' } }}
            disabled
          />
          <Typography>PAW</Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        onClick={handleContribute}
        sx={{ padding: '12px', color: 'background.default' }}
        disabled={TGEStatus !== 'Active' ? true : false}
      >
        Contribute
      </Button>
      <Typography
        sx={{
          fontSize: downToSM ? '10px' : '12px',
          alignSelf: 'end',
          mt: downToSM ? '-8px' : '-18px',
        }}
      >{`YOU HAVE CONTRIBUTED ${contributedBNB} BNB`}</Typography>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={
            snackbarMessage === 'Contribution Success!'
              ? 'success'
              : snackbarMessage === 'Sale has ended.'
              ? 'warning'
              : 'error'
          }
          sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TGEMainContribution;
