import { Button, CircularProgress } from '@mui/material';
import { Contract } from 'ethers';
import React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import GLP_REWARDS_DISTRIBUTION_ABI from 'src/maneki/abi/GlpRewardsDistributionABI';
import { ITxStatus } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import { marketsData } from 'src/ui-config/marketsConfig';

interface ClaimRewardTokenProps {
  REWARD_TOKEN_ADDR: string[];
  refresh: boolean;
  setRefresh: (value: boolean) => void;
  fetchError: boolean;
  setTxStatus: (value: ITxStatus) => void;
}

export default function ClaimRewardButton({
  REWARD_TOKEN_ADDR,
  refresh,
  setRefresh,
  fetchError,
  setTxStatus,
}: ClaimRewardTokenProps) {
  const { provider, currentAccount } = useWeb3Context();
  const [loading, setLoading] = React.useState<boolean>(false);
  const GLP_REWARDS_DISTRIBUTION_ADDR = marketsData.arbitrum_mainnet_v3.addresses
    .GLP_REWARDS_DISTRIBUTION as string;

  const handleClaimReward = async () => {
    setLoading(true);
    const signer = provider?.getSigner(currentAccount);
    const contract = new Contract(
      GLP_REWARDS_DISTRIBUTION_ADDR,
      GLP_REWARDS_DISTRIBUTION_ABI,
      signer
    );
    try {
      const promise = await contract.getReward(REWARD_TOKEN_ADDR);
      promise.wait(1);
      setTxStatus({ status: 'success', message: 'Claim rewards successful', hash: promise.hash });
      setRefresh(true);
    } catch (error) {
      setTxStatus({ status: 'error', message: error.message });
      console.log('Error Claiming Rewards: ', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (refresh) setLoading(true);
  }, [refresh]);
  return (
    <Button
      variant="contained"
      sx={{ width: '100%', color: 'background.default', p: '8px 0px' }}
      onClick={handleClaimReward}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: 'background.default' }} />
      ) : fetchError ? (
        'Refetch Data'
      ) : (
        'Claim'
      )}
    </Button>
  );
}
