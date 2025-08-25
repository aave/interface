import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  ProtocolAction,
} from '@aave/contract-helpers';
import { useMeritClaimRewards } from '@aave/react';
import { Trans } from '@lingui/macro';
import { BigNumber, PopulatedTransaction, utils } from 'ethers';
import { Reward } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type ClaimRewardsActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedReward: Reward;
};

export const ClaimRewardsActions = ({
  isWrongNetwork,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const claimRewards = useRootStore((state) => state.claimRewards);
  const { reserves } = useAppDataContext();

  const { currentAccount } = useWeb3Context();

  const [currentMarketData, estimateGasLimit] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.estimateGasLimit])
  );

  const { data: meritClaimRewards } = useMeritClaimRewards({
    user: currentAccount,
    chainId: currentMarketData.chainId,
  });

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    protocolAction: ProtocolAction.claimRewards,
    eventTxInfo: {
      assetName: selectedReward.symbol,
      amount: selectedReward.balance,
    },
    tryPermit: false,
    handleGetTxns: async () => {
      // Check if we need to claim both protocol and merit rewards
      const isClaimingAll = selectedReward.symbol === 'all';
      const isClaimingMeritAll = selectedReward.symbol === 'merit-all';
      const isClaimingProtocolAll = selectedReward.symbol === 'protocol-all';
      const hasProtocolRewards = selectedReward.incentiveControllerAddress !== 'MERIT_REWARD';
      const hasMeritRewards = meritClaimRewards?.rewards && meritClaimRewards.rewards.length > 0;
      const isIndividualProtocolReward =
        hasProtocolRewards && !isClaimingAll && !isClaimingProtocolAll && !isClaimingMeritAll;

      // Use simple approach for individual protocol rewards (most common case)
      if (isIndividualProtocolReward) {
        return claimRewards({
          isWrongNetwork,
          blocked,
          selectedReward,
          formattedReserves: reserves,
        });
      }

      // Use complex multicall logic only when needed
      if (isClaimingAll && hasProtocolRewards && hasMeritRewards) {
        // Get protocol rewards transaction
        const protocolTxns = await claimRewards({
          isWrongNetwork,
          blocked,
          selectedReward,
          formattedReserves: reserves,
        });

        // Create multicall transaction that includes both protocol and merit claims
        if (!meritClaimRewards?.transaction) {
          throw new Error('Merit rewards transaction not available');
        }
        const multicallTx = await createMulticallTransaction(
          protocolTxns,
          meritClaimRewards.transaction
        );

        // Check if there are any approval transactions that need to be handled separately
        const approvalTxns = protocolTxns.filter((tx) => tx.txType === 'ERC20_APPROVAL');

        return approvalTxns.length > 0 ? [...approvalTxns, multicallTx] : [multicallTx];
      } else if ((isClaimingAll && !hasProtocolRewards && hasMeritRewards) || isClaimingMeritAll) {
        // Only merit rewards - use merit transaction directly
        if (!meritClaimRewards?.transaction) {
          throw new Error('Merit rewards transaction not available');
        }
        return [convertMeritTransactionToEthereum(meritClaimRewards.transaction)];
      } else {
        // Protocol-all or other cases - use existing protocol logic
        return claimRewards({
          isWrongNetwork,
          blocked,
          selectedReward,
          formattedReserves: reserves,
        });
      }
    },
    skip: Object.keys(selectedReward).length === 0 || blocked,
    deps: [selectedReward, meritClaimRewards],
  });

  // Helper function to create multicall transaction
  const createMulticallTransaction = async (
    protocolTxns: EthereumTransactionTypeExtended[],
    meritTransaction: PopulatedTransaction
  ): Promise<EthereumTransactionTypeExtended> => {
    // Multicall3 contract address (same across chains)
    const multicallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';

    const calls = [];

    for (const txExt of protocolTxns) {
      if (txExt.txType === 'ERC20_APPROVAL') continue; // Skip approvals for multicall

      const tx = await txExt.tx();
      calls.push({
        target: tx.to,
        callData: tx.data,
        value: tx.value || '0',
      });
    }

    calls.push({
      target: meritTransaction.to,
      callData: meritTransaction.data,
      value: meritTransaction.value || '0',
    });

    const multicallInterface = new utils.Interface([
      'function aggregate3Value((address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[])',
    ]);

    const callsWithFailure = calls.map((call) => [
      call.target,
      false, // allowFailure = false
      call.value,
      call.callData,
    ]);

    const data = multicallInterface.encodeFunctionData('aggregate3Value', [callsWithFailure]);

    return {
      txType: eEthereumTxType.DLP_ACTION,
      tx: async () => ({
        to: multicallAddress,
        from: currentAccount,
        data,
        value: '0',
      }),
      gas: async () => {
        try {
          const tx = {
            to: multicallAddress,
            from: currentAccount,
            data,
            value: BigNumber.from('0'),
          };

          const estimatedTx = await estimateGasLimit(tx, currentMarketData.chainId);

          return {
            gasLimit: estimatedTx.gasLimit?.toString(),
            gasPrice: '0',
          };
        } catch (error) {
          console.warn('Gas estimation failed for multicall, using fallback:', error);
          return {
            gasLimit: '800000', // Conservative fallback
            gasPrice: '0',
          };
        }
      },
    };
  };

  // Helper function to convert merit transaction to Ethereum format
  const convertMeritTransactionToEthereum = (
    meritTx: PopulatedTransaction
  ): EthereumTransactionTypeExtended => {
    return {
      txType: eEthereumTxType.DLP_ACTION,
      tx: async () => ({
        to: meritTx.to,
        from: meritTx.from || currentAccount,
        data: meritTx.data,
        value: meritTx.value
          ? BigNumber.isBigNumber(meritTx.value)
            ? meritTx.value.toString()
            : meritTx.value
          : '0',
      }),
      gas: async () => {
        try {
          const tx = {
            to: meritTx.to,
            from: meritTx.from || currentAccount,
            data: meritTx.data,
            value: meritTx.value,
          };

          const estimatedTx = await estimateGasLimit(tx, currentMarketData.chainId);

          return {
            gasLimit: estimatedTx.gasLimit?.toString(),
            gasPrice: '0',
          };
        } catch (error) {
          console.warn('Gas estimation failed for merit transaction, using fallback:', error);
          return {
            gasLimit: '400000',
            gasPrice: '0',
          };
        }
      },
    };
  };

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === 'all' ? (
          <Trans>Claim all</Trans>
        ) : selectedReward.symbol === 'merit-all' ? (
          <Trans>Claim all merit rewards</Trans>
        ) : selectedReward.symbol === 'protocol-all' ? (
          <Trans>Claim all protocol rewards</Trans>
        ) : (
          <Trans>Claim {selectedReward.symbol}</Trans>
        )
      }
      actionInProgressText={<Trans>Claiming</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
