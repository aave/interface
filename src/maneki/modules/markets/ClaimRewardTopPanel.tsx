import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import React from 'react';
import { ReactNode } from 'react-markdown/lib/react-markdown';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import GLP_REWARDS_DISTRIBUTION_ABI from 'src/maneki/abi/GlpRewardsDistributionABI';
import { useTxStateStore } from 'src/maneki/store/txStates';
import { marketsData } from 'src/ui-config/marketsConfig';

import ClaimRewardButton from './ClaimRewardButton';

export default function ClaimRewardTopPanel() {
  const GLP_REWARDS_DISTRIBUTION_ADDR = marketsData.arbitrum_mainnet_v3.addresses
    .GLP_REWARDS_DISTRIBUTION as string;
  const { provider, currentAccount, chainId } = useWeb3Context();
  const [rewardAmount, setRewardAmount] = React.useState(BigNumber.from(0));
  const [fetchError, setFetchError] = React.useState(false);
  const setTxState = useTxStateStore((state) => state.setTxState);
  const [refresh, setRefresh] = React.useState<boolean>(true);
  const REWARD_TOKEN_ADDR = ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'];
  React.useEffect(() => {
    if (!provider || !currentAccount) return;
    if (!refresh && !fetchError) return;
    const contract = new Contract(
      GLP_REWARDS_DISTRIBUTION_ADDR,
      GLP_REWARDS_DISTRIBUTION_ABI,
      provider
    );

    Promise.resolve(contract.unclaimedReward(currentAccount, REWARD_TOKEN_ADDR[0]))
      .then((data) => {
        setRewardAmount(data);
        setFetchError(false);
      })
      .catch((error) => {
        setFetchError(true);
        setTxState({ status: 'error', message: error.message });
        console.log('Error fetching claim ETH Rewards: ', error);
      });
    setRefresh(false);
  }, [provider, currentAccount, fetchError]);

  if (!provider || !currentAccount || chainId !== marketsData.arbitrum_mainnet_v3.chainId)
    return <></>;

  return (
    <ClaimRewardContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography sx={{ color: (theme) => theme.palette.text.secondary }} variant="description">
          <Trans>Total Rewards</Trans>:{' '}
        </Typography>
        {fetchError ? (
          <NoData />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Image
              alt={`token image for paw`}
              src={`/icons/tokens/eth.svg`}
              width={24}
              height={24}
            />
            <FormattedNumber
              value={utils.formatUnits(rewardAmount, 18 + 12)}
              sx={{ fontWeight: '500', fontSize: '14px' }}
              symbol="ETH"
            />
          </Box>
        )}
      </Box>
      <ClaimRewardButton {...{ REWARD_TOKEN_ADDR, refresh, setRefresh, fetchError }} />
    </ClaimRewardContainer>
  );
}

function ClaimRewardContainer({ children }: { children: ReactNode }) {
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
      {children}
    </Box>
  );
}
