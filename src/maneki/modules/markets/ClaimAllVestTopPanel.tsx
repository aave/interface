import { Box, Button, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
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

const ClaimAllVestTopPanel = () => {
  const LENDING_PROTOCOL_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;
  const CHEF_INCENTIVES_CONTROLLER_ADDR = marketsData.bsc_testnet_v3.addresses
    .CHEF_INCENTIVES_CONTROLLER as string;
  const { provider, currentAccount } = useWeb3Context();
  const [tokenAddresses, setTokenAddresses] = useState<TokenAddress[] | undefined>(undefined);
  const [totalVests, setTotalVests] = useState<BigNumber>(BigNumber.from(-1));

  const handleClaimVest = async () => {
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
      console.log('Successfully Claim all Vests');
    } catch (error) {
      console.error('unable to claim vests');
    }
  };

  useEffect(() => {
    if (!provider || !currentAccount) return;
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
        // console.log(addresses);
        const getClaimableRewardsPromise: BigNumber[] =
          await chefIncentivesContract.claimableReward(currentAccount, addresses);
        let vestsSum = BigNumber.from(0);
        tokenAddressesPromise.map((token, index) => {
          token.value = getClaimableRewardsPromise[index];
          vestsSum = vestsSum.add(getClaimableRewardsPromise[index]);
        });
        setTokenAddresses(tokenAddressesPromise);
        setTotalVests(vestsSum);
      } catch (error) {
        console.log('error getting tokens in markets');
      }
    };
    getTokensAddress();
  }, [currentAccount, provider]);
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
        <Typography sx={{ fontWeight: '500', fontSize: '16px' }}>Total Vests: </Typography>
        {/** Set Loading if totalVest = -1 */}
        <FormattedNumber
          value={utils.formatUnits(totalVests, 18)}
          visibleDecimals={7}
          sx={{ fontWeight: '500', fontSize: '16px' }}
        />
        <Typography sx={{ fontWeight: '500', fontSize: '16px' }}> PAW</Typography>
      </Box>
      <Button variant="contained" sx={{ width: '100%' }} onClick={handleClaimVest}>
        Claim All Vests
      </Button>
    </Box>
  );
};

export default ClaimAllVestTopPanel;
