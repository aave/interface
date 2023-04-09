/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
import { Paper } from '@mui/material';
import * as React from 'react';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { StakeInfo } from './StakeInfo';
import { StakeMain } from './StakeMain';

export const StakeContainer = () => {
  const { currentAccount, loading: web3Loading, chainId } = useWeb3Context();

  if (!currentAccount || web3Loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet.</Trans>}
      />
    );
  }

  if (chainId != 97) {
    return <Paper> Please connect to bsc testnet </Paper>;
  }

  return (
    <Paper>
      {/* Main stake input */}
      <StakeMain />

      {/* Stake info panel */}
      <StakeInfo />
    </Paper>
  );
};
