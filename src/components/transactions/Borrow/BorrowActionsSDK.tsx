import { bigDecimal, ChainId, evmAddress } from '@aave/client';
import { approveBorrowCreditDelegation, borrow } from '@aave/client/actions';
import { sendWith } from '@aave/client/viem';
import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { client } from 'pages/_app.page';
import React, { useEffect, useState } from 'react';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getWalletClient } from 'wagmi/actions';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVE_DELEGATION_GAS_LIMIT } from '../utils';

export interface BorrowActionsPropsSDK extends BoxProps {
  poolReserve: ReserveWithId;
  amountToBorrow: string;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  borrowNative: boolean;
  blocked: boolean;
}

export const BorrowActionsSDK = React.memo(
  ({
    symbol,
    poolReserve,
    amountToBorrow,
    poolAddress,
    isWrongNetwork,
    borrowNative,
    blocked,
    sx,
  }: BorrowActionsPropsSDK) => {
    const [currentMarketData, addTransaction] = useRootStore(
      useShallow((state) => [state.currentMarketData, state.addTransaction])
    );
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setMainTxState,
      setTxError,
      setGasLimit,
      setLoadingTxns,
      setApprovalTxState,
    } = useModalContext();

    const queryClient = useQueryClient();
    const { borrowReserves } = useAppDataContext();
    const { currentAccount, chainId: userChainId } = useWeb3Context();
    const [requiresApproval, setRequiresApproval] = useState(
      borrowNative && poolAddress === API_ETH_MOCK_ADDRESS
    );
    console.log('BorrowActionsSDK render requiresApproval:', requiresApproval);
    console.log('PoolAddress', poolAddress);
    useEffect(() => {
      setRequiresApproval(
        borrowNative && poolAddress === API_ETH_MOCK_ADDRESS && !approvalTxState.success
      );
    }, [borrowNative, poolAddress, approvalTxState.success]);

    const handleApproval = async () => {
      if (!currentAccount) return;
      try {
        setApprovalTxState({ ...approvalTxState, loading: true });
        const walletClient = await getWalletClient(wagmiConfig, {
          chainId: currentMarketData.chainId ?? userChainId,
        });
        if (!walletClient) {
          throw new Error('Wallet client not available');
        }

        const approvalResult = await approveBorrowCreditDelegation(client, {
          market: evmAddress(currentMarketData.addresses.LENDING_POOL),
          underlyingToken: evmAddress(poolReserve.underlyingToken.address),
          amount: bigDecimal(amountToBorrow),
          user: evmAddress(currentAccount),
          delegatee: evmAddress(currentMarketData.addresses.WETH_GATEWAY ?? currentAccount),
          chainId: (currentMarketData.chainId ?? userChainId) as ChainId,
        }).andThen(sendWith(walletClient));

        if (approvalResult.isErr()) {
          const parsedError = getErrorTextFromError(
            approvalResult.error as Error,
            TxAction.APPROVAL,
            false
          );
          setTxError(parsedError);
          setApprovalTxState({ txHash: undefined, loading: false });
          return;
        }

        const txHash = String(approvalResult.value);
        setApprovalTxState({ txHash, loading: false, success: true });
        setRequiresApproval(false);
        setTxError(undefined);
      } catch (error) {
        const parsedError = getErrorTextFromError(error as Error, TxAction.APPROVAL, false);
        setTxError(parsedError);
        setApprovalTxState({ txHash: undefined, loading: false });
      }
    };

    useEffect(() => {
      let borrowGasLimit = Number(gasLimitRecommendations[ProtocolAction.borrow].recommended);
      if (requiresApproval && !approvalTxState.success) {
        borrowGasLimit += Number(APPROVE_DELEGATION_GAS_LIMIT);
      }
      setGasLimit(borrowGasLimit.toString());
    }, [requiresApproval, approvalTxState.success, setGasLimit]);

    const handleAction = async () => {
      if (!amountToBorrow || Number(amountToBorrow) === 0) return;
      if (requiresApproval && !approvalTxState.success) {
        setTxError(
          getErrorTextFromError(
            new Error('Approval required before borrowing'),
            TxAction.APPROVAL,
            false
          )
        );
        return;
      }
      try {
        setLoadingTxns(true);
        setMainTxState({ ...mainTxState, loading: true });
        setTxError(undefined);

        const walletClient = await getWalletClient(wagmiConfig, {
          chainId: currentMarketData.chainId ?? userChainId,
        });

        if (!walletClient) {
          throw new Error('Wallet client not available');
        }
        const amountInput = borrowNative
          ? { native: bigDecimal(amountToBorrow) }
          : {
              erc20: {
                currency: evmAddress(poolAddress),
                value: bigDecimal(amountToBorrow),
              },
            };

        const result = await borrow(client, {
          market: evmAddress(currentMarketData.addresses.LENDING_POOL),
          amount: amountInput,
          sender: evmAddress(currentAccount),
          chainId: (currentMarketData.chainId ?? userChainId) as ChainId,
        })
          .andThen(sendWith(walletClient))
          .andThen(client.waitForTransaction);
        if (result.isErr()) {
          const parsedError = getErrorTextFromError(
            result.error as Error,
            TxAction.MAIN_ACTION,
            false
          );
          setTxError(parsedError);
          setMainTxState({ txHash: undefined, loading: false });
          return;
        }

        const txHash = String(result.value);
        setMainTxState({
          txHash,
          loading: false,
          success: true,
        });

        addTransaction(txHash, {
          action: ProtocolAction.borrow,
          txState: 'success',
          asset: poolAddress,
          amount: amountToBorrow,
          assetName: symbol,
          amountUsd: (() => {
            const reserve = borrowReserves.find(
              (r) => r.underlyingToken.address.toLowerCase() === poolAddress.toLowerCase()
            );
            return reserve
              ? valueToBigNumber(amountToBorrow).multipliedBy(reserve.usdExchangeRate).toString()
              : undefined;
          })(),
        });

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
      } catch (error) {
        const parsedError = getErrorTextFromError(error as Error, TxAction.MAIN_ACTION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      } finally {
        setLoadingTxns(false);
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        requiresAmount={true}
        amount={amountToBorrow}
        isWrongNetwork={isWrongNetwork}
        handleAction={handleAction}
        actionText={<Trans>Borrow {symbol}</Trans>}
        actionInProgressText={<Trans>Borrowing {symbol}</Trans>}
        handleApproval={requiresApproval ? handleApproval : undefined}
        requiresApproval={requiresApproval}
        preparingTransactions={loadingTxns}
        sx={sx}
      />
    );
  }
);
