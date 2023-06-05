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
import { BigNumber, Contract, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import CHEF_INCENTIVES_CONTROLLER_ABI from 'src/maneki/abi/chefIncentivesControllerABI';
import LENDING_PROTOCOL_DATA_PROVIDER_ABI from 'src/maneki/abi/lendingProtocolDataProviderABI';
import { marketsData } from 'src/ui-config/marketsConfig';

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

export type ATokenTuple = [string, string];

interface TokenAddress {
  symbol: string;
  address: string;
  value?: BigNumber;
}

type buttonStateType = 'loading' | 'enable' | 'disable' | 'success' | 'getError' | 'claimError';

const ClaimAllVestTopPanel = () => {
  const LENDING_PROTOCOL_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;
  const CHEF_INCENTIVES_CONTROLLER_ADDR = marketsData.bsc_testnet_v3.addresses
    .CHEF_INCENTIVES_CONTROLLER as string;
  const { provider, currentAccount } = useWeb3Context();
  const [tokenAddresses, setTokenAddresses] = useState<TokenAddress[] | undefined>(undefined);
  const [totalVests, setTotalVests] = useState<BigNumber>(BigNumber.from(-1));
  const [buttonState, setButtonState] = useState<buttonStateType>('loading');
  const [errorText, setErrorText] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(true);
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

  useEffect(() => {
    if (!provider || !currentAccount || !refresh) return;
    const getTokensAddress = async () => {
      const lendingProtocolContract = new Contract(
        LENDING_PROTOCOL_DATA_PROVIDER_ADDR,
        LENDING_PROTOCOL_DATA_PROVIDER_ABI,
        provider
      );
      const chefIncentivesContract = new Contract(
        CHEF_INCENTIVES_CONTROLLER_ADDR,
        CHEF_INCENTIVES_CONTROLLER_ABI,
        provider
      );
      try {
        const getTokenAddressPromise: ATokenTuple[] =
          (await lendingProtocolContract.getAllATokens()) as ATokenTuple[];
        const tokenAddressesPromise: TokenAddress[] = getTokenAddressPromise.map(
          ([symbol, tokenAddress]) => ({
            symbol,
            address: tokenAddress,
          })
        );
        const addresses = tokenAddressesPromise.map((x) => x.address);
        const getClaimableRewardsPromise: BigNumber[] =
          await chefIncentivesContract.claimableReward(currentAccount, addresses);
        let vestsSum = BigNumber.from(0);
        tokenAddressesPromise.map((token, index) => {
          token.value = getClaimableRewardsPromise[index];
          vestsSum = vestsSum.add(getClaimableRewardsPromise[index]);
        });
        setTokenAddresses(tokenAddressesPromise);
        setTotalVests(vestsSum);
        setButtonState('enable');
        setErrorText('');
      } catch (error) {
        setButtonState('getError');
        setErrorText(error.message);
        console.log('error getting tokens in markets');
      }
    };
    getTokensAddress();
    setRefresh(false);
    //eslint-disable-next-line
  }, [currentAccount, provider, refresh]);
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        minWidth: { xs: 'calc(50% - 12px)', xsm: '238px' },
        padding: '16px',
        backgroundColor: theme.palette.background.surface,
        borderRadius: '8px',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Typography sx={{ fontWeight: '500', fontSize: '14px' }}>Total Vests: </Typography>
        {totalVests.lt(0) ? (
          <NoData />
        ) : (
          <FormattedNumber
            value={utils.formatUnits(totalVests, 18)}
            visibleDecimals={7}
            sx={{ fontWeight: '500', fontSize: '14px' }}
            symbol="PAW"
          />
        )}
      </Box>

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
    </Box>
  );
};

export default ClaimAllVestTopPanel;
