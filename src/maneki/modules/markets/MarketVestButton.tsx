import { Trans } from '@lingui/macro';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  CircularProgress,
  experimental_sx,
  Popper,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import * as React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import CHEF_INCENTIVES_CONTROLLER_ABI from 'src/maneki/abi/chefIncentivesControllerABI';
import { marketsData } from 'src/ui-config/marketsConfig';

import { buttonStateType, TokenAddressType } from './ClaimAllVestTopPanel';

const PopperComponent = styled(Popper)(
  experimental_sx({
    '.MuiTooltip-tooltip': {
      color: 'text.primary',
      backgroundColor: 'background.paper',
      p: 0,
      borderRadius: '6px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '280px',
    },
    '.MuiTooltip-arrow': {
      color: 'background.paper',
      '&:before': {
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  })
);

interface MarketVestButtonProps {
  tokenAddresses: TokenAddressType[] | undefined;
  buttonState: buttonStateType;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setButtonState: React.Dispatch<React.SetStateAction<buttonStateType>>;
  setTotalVests: React.Dispatch<React.SetStateAction<BigNumber>>;
  errorText: string;
  setErrorText: React.Dispatch<React.SetStateAction<string>>;
}

const MarketVestButton = ({
  tokenAddresses,
  buttonState,
  setRefresh,
  setButtonState,
  setTotalVests,
  errorText,
  setErrorText,
}: MarketVestButtonProps) => {
  const { provider, currentAccount } = useWeb3Context();
  const CHEF_INCENTIVES_CONTROLLER_ADDR = marketsData.bsc_testnet_v3.addresses
    .CHEF_INCENTIVES_CONTROLLER as string;
  const handleClaimVest = async () => {
    setButtonState('loading');
    const signer = provider?.getSigner(currentAccount as string);
    const chefIncentivesContract = new Contract(
      CHEF_INCENTIVES_CONTROLLER_ADDR,
      CHEF_INCENTIVES_CONTROLLER_ABI,
      signer
    );
    const addresses = tokenAddresses?.map((tokens) => tokens.address);
    try {
      const promise = await chefIncentivesContract.claim(currentAccount, addresses);
      await promise.wait(1);
      setButtonState('success');
      setTotalVests(BigNumber.from(-1));
      setErrorText('');
    } catch (error) {
      setErrorText(error.message);
      setButtonState('claimError');
    }
  };
  return (
    <>
      {buttonState === 'enable' && (
        <Button
          variant="contained"
          sx={{ width: '100%', color: 'background.default', p: '8px 0px' }}
          onClick={handleClaimVest}
        >
          <Trans>Claim All Vests</Trans>
        </Button>
      )}
      {buttonState === 'loading' && (
        <Button
          variant="contained"
          sx={{ width: '100%', color: 'background.default', p: '8px 0px' }}
          disabled
        >
          <CircularProgress color="inherit" size={24} />
        </Button>
      )}
      {(buttonState === 'getError' || buttonState === 'claimError') && (
        <Button
          variant="contained"
          sx={{
            width: '100%',
            backgroundColor: 'error.main',
            color: 'background.default',
            p: '8px 0px',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }}
          onClick={() => {
            navigator.clipboard.writeText(errorText);
            setRefresh(true);
          }}
          title="Click to Refresh"
        >
          {buttonState === 'getError' ? (
            <Trans>Loading Error</Trans>
          ) : buttonState === 'claimError' ? (
            <Trans>Transaction Error</Trans>
          ) : (
            <Trans>Something Went Wrong</Trans>
          )}
          {/* need to store error text and let user copy error text */}
          <Tooltip
            title={
              <Box sx={{ padding: '12px' }}>
                {buttonState === 'getError' ? (
                  <Typography sx={{ fontSize: '12px' }}>
                    <Trans>
                      An Issue was encountered while attempting to <b>load</b> total vests PAW.
                    </Trans>
                  </Typography>
                ) : buttonState === 'claimError' ? (
                  <Typography sx={{ fontSize: '12px' }}>
                    <Trans>
                      An Issue was encountered while attempting to <b>claim</b> Vests PAW.
                    </Trans>
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: '12px' }}>
                    <Trans>An Issue was encountered please report it to our Maneki Team.</Trans>
                  </Typography>
                )}
                <Typography sx={{ fontSize: '12px', mt: '8px' }}>
                  <Trans>
                    Click on button to <b>refresh and copy</b> error message.
                  </Trans>
                </Typography>
              </Box>
            }
            arrow
            placement="top"
            PopperComponent={PopperComponent}
          >
            <InfoOutlinedIcon
              sx={{
                ml: '14px',
                width: '14px',
                height: '14px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'error.light',
                },
              }}
            />
          </Tooltip>
        </Button>
      )}
      {buttonState === 'success' && (
        <Button
          variant="contained"
          sx={{
            width: '100%',
            color: 'background.default',
            backgroundColor: 'success.main',
            p: '8px 0px',
            '&:hover': {
              backgroundColor: 'success.dark',
            },
          }}
          onClick={() => setRefresh(true)}
          title="Click to Refresh"
        >
          <Trans>Claim Successful</Trans>
          <Tooltip
            title={
              <Box sx={{ padding: '12px' }}>
                <Typography sx={{ fontSize: '12px' }}>
                  <Trans>
                    You have successfully claim your vests PAW, for more details please go to our{' '}
                    <b>Manage PAW page</b>.
                  </Trans>
                </Typography>
                <Typography sx={{ fontSize: '12px', mt: '8px' }}>
                  <Trans>
                    Click on button to <b>refresh</b> and view your new vests balance.
                  </Trans>
                </Typography>
              </Box>
            }
            arrow
            placement="top"
            PopperComponent={PopperComponent}
          >
            <InfoOutlinedIcon
              sx={{
                ml: '14px',
                width: '14px',
                height: '14px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'success.light',
                },
              }}
            />
          </Tooltip>
        </Button>
      )}
    </>
  );
};

export default MarketVestButton;
