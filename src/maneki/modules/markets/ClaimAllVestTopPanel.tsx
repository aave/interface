import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import CHEF_INCENTIVES_CONTROLLER_ABI from 'src/maneki/abi/chefIncentivesControllerABI';
import LENDING_PROTOCOL_DATA_PROVIDER_ABI from 'src/maneki/abi/lendingProtocolDataProviderABI';
import { marketsData } from 'src/ui-config/marketsConfig';

import MarketVestButton from './MarketVestButton';

export type ATokenTuple = [string, string];

export interface TokenAddressType {
  symbol: string;
  address: string;
  value?: BigNumber;
}

export type buttonStateType =
  | 'loading'
  | 'enable'
  | 'disable'
  | 'success'
  | 'getError'
  | 'claimError';

const ClaimAllVestTopPanel = () => {
  const LENDING_PROTOCOL_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;
  const CHEF_INCENTIVES_CONTROLLER_ADDR = marketsData.bsc_testnet_v3.addresses
    .CHEF_INCENTIVES_CONTROLLER as string;
  const { provider, currentAccount } = useWeb3Context();

  const [tokenAddresses, setTokenAddresses] = useState<TokenAddressType[] | undefined>(undefined);
  const [totalVests, setTotalVests] = useState<BigNumber>(BigNumber.from(-1));
  const [buttonState, setButtonState] = useState<buttonStateType>('loading');
  const [errorText, setErrorText] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(true);

  useEffect(() => {
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
        const tokenAddressesPromise: TokenAddressType[] = getTokenAddressPromise.map(
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
        <Typography sx={{ fontWeight: '500', fontSize: '14px' }}>
          <Trans>Total Vests</Trans>:{' '}
        </Typography>
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
      <MarketVestButton
        {...{
          tokenAddresses,
          buttonState,
          setRefresh,
          setButtonState,
          setTotalVests,
          errorText,
          setErrorText,
        }}
      />
    </Box>
  );
};

export default ClaimAllVestTopPanel;
