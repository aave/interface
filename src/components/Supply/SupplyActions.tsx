import { ChainId, EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import Link from 'next/link';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxState } from './SupplyModal';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { TextWithModal } from '../TextWithModal';
import { ApprovalInfoContent } from '../infoModalContents/ApprovalInfoContent';
import DoneIcon from '@mui/icons-material/Done';
import { RetryWithApprovalInfoContent } from '../infoModalContents/RetryWithApprovalInfoContent';
import { useTransactionHandler } from './useTransactionHandler';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  onClose: () => void;
  amount: string;
  isWrongNetwork: boolean;
  setTxState: Dispatch<SetStateAction<TxState>>;
};

export enum SupplyState {
  amountInput = 0,
  approval,
  sendTx,
  success,
  error,
}

export const SupplyActions = ({ amountToSupply, poolReserve }: SupplyActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  // Custom gas
  const [customGasPrice, setCustomGasPrice] = useState<string>();

  const {
    approval,
    approved,
    action,
    requiresApproval,
    loading,
    setUsePermit,
    approvalTxnHash,
    mainTxnHash,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        return await newPool.supply({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      } else {
        return await lendingPool.deposit({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      }
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      return await newPool.supplyWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToSupply,
        signature,
      });
    },
    customGasPrice,
    skip: !amountToSupply || amountToSupply === '0',
  });

  const hasAmount = amountToSupply && amountToSupply !== '0';

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      {approvalTxnHash} / {mainTxnHash}
      {!hasAmount && <button disabled>{!loading ? 'enter an amount' : 'loading'}</button>}
      {hasAmount && requiresApproval && (
        <button
          onClick={() => approval(amountToSupply, poolReserve.underlyingAsset)}
          disabled={approved || loading}
        >
          {!approved && !loading && 'approve to continue'}
          {!approved && loading && 'loading'}
          {approved && 'approval confirmed'}
        </button>
      )}
      {hasAmount && (
        <button onClick={action} disabled={loading || (requiresApproval && !approved)}>
          supply
        </button>
      )}
      <button onClick={() => setUsePermit(false)}>use Approval flow</button>
    </Box>
  );
};
