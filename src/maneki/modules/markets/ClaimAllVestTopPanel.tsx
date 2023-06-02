import { Trans } from '@lingui/macro';
import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import CHEF_INCENTIVES_CONTROLLER_ABI from 'src/maneki/abi/chefIncentivesControllerABI';
import LENDING_PROTOCOL_DATA_PROVIDER_ABI from 'src/maneki/abi/lendingProtocolDataProviderABI';
import { marketsData } from 'src/ui-config/marketsConfig';
// Call contract to
// LENDING_PROTOCOL_DATA_PROVIDER
// CHEF_INCENTIVES_CONTROLLER

export type ATokenTuple = [string, string];

interface TokenAddress {
  symbol: string;
  address: string;
  value?: BigNumber;
}

type buttonStateType = 'loading' | 'enable' | 'disable' | 'success' | 'error';

const ClaimAllVestTopPanel = () => {
  const LENDING_PROTOCOL_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;
  const CHEF_INCENTIVES_CONTROLLER_ADDR = marketsData.bsc_testnet_v3.addresses
    .CHEF_INCENTIVES_CONTROLLER as string;
  const { provider, currentAccount } = useWeb3Context();
  const [tokenAddresses, setTokenAddresses] = useState<TokenAddress[] | undefined>(undefined);
  const [totalVests, setTotalVests] = useState<BigNumber>(BigNumber.from(-1));
  const [buttonState, setButtonState] = useState<buttonStateType>('loading');
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
    } catch (error) {
      setButtonState('error');
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
      } catch (error) {
        setButtonState('error');
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
      {buttonState === 'error' && (
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
          onClick={() => setRefresh(true)}
          title="Click to Refresh"
        >
          <Trans>Error</Trans>
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
          <CheckIcon sx={{ ml: '12px' }} />
          <Trans>Success</Trans>
        </Button>
      )}
    </Box>
  );
};

export default ClaimAllVestTopPanel;
