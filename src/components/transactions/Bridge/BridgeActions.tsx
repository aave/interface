import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { queryClient } from 'pages/_app.page';
import React, { useEffect, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount, useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { providers, Contract, utils, constants } from 'ethers';
import { getRouterConfig } from './Router';
import routerAbi from './Router-abi.json';
import erc20Abi from './IERC20Meta.json';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { NetworkConfiguration } from '../NetworkSelect';

interface TokenAmount {
  token: string;
  amount: string;
}

export interface BridgeActionProps extends BoxProps {
  amountToBridge: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  sourceChain: number;
  destinationChain: {
    chainId: number;
  };
  destinationAccount: string;
  tokenAddress: any;
  fees: string;
  // setBridgeFee: (fee: string) => void;
  message: {
    receiver: string;
    data: string;
    tokenAmounts: TokenAmount[];
    feeToken: string;
    extraArgs: string;
  };
}

export const BridgeActions = React.memo(
  ({
    amountToBridge,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    tokenAddress,
    sourceChain,
    destinationChain,
    destinationAccount, // user
    // setBridgeFee,
    message,
    fees,
    ...props
  }: BridgeActionProps) => {
    const { provider } = useWeb3Context();
    const [walletApprovalMethodPreference, estimateGasLimit, addTransaction, currentMarketData] =
      useRootStore((state) => [
        state.walletApprovalMethodPreference,
        state.estimateGasLimit,
        state.addTransaction,
        state.currentMarketData,
      ]);
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
    } = useModalContext();
    const [user] = useRootStore((state) => [state.account]);

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isFetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = useApprovedAmount({
      marketData: currentMarketData,
      token: tokenAddress,
      spender: getRouterConfig(sourceChain).address, // ETH SEPOLIA ROUTER
    });

    setLoadingTxns(fetchingApprovedAmount);

    // setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToBridge) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount ? approvedAmount.toString() : '0',
        amount: amountToBridge,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

    const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    const { approval } = useApprovalTx({
      usePermit: false,
      approvedAmount: {
        amount: approvedAmount?.toString() || '0',
        user: user,
        token: tokenAddress,
        spender: getRouterConfig(sourceChain).address,
      },
      requiresApproval,
      assetAddress: tokenAddress,
      symbol: 'GHO',
      decimals: 18,
      signatureAmount: amountToBridge,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
    });

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0;
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended
        );
      } else {
        supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
        }
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        const signer = await provider.getSigner();

        let response: TransactionResponse;
        let action = ProtocolAction.default;

        const erc20 = new Contract(tokenAddress, erc20Abi, signer);

        //   // Get the router's address for the specified chain
        const sourceRouterAddress = getRouterConfig(sourceChain).address;
        const sourceChainSelector = getRouterConfig(sourceChain).chainSelector;
        // Get the chain selector for the target chain
        const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;
        const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

        let sendTx;
        // let approvalTx = await erc20.approve(sourceRouterAddress, amountToBridge);
        // await approvalTx.wait();

        console.log(
          `approved router ${sourceRouterAddress} to spend ${amountToBridge} of token ${tokenAddress}.`
        );

        // let sendTxWithFeeData = sourceRouter.ccipSend(destinationChainSelector, message, {
        //   value: fees,
        // }); //

        // continue here, permit might not be needed

        sendTx = await sourceRouter.ccipSend(destinationChainSelector, message, {
          value: fees,
        });

        console.log('1', sendTx);
        // preparedTx = await estimateGasLimit(preparedTx);
        console.log('2');

        const receipt = await sendTx.wait();
        console.log('4');

        // Simulate a call to the router to fetch the messageID
        const call = {
          from: sendTx.from,
          to: sendTx.to,
          data: sendTx.data,
          gasLimit: sendTx.gasLimit,
          gasPrice: sendTx.gasPrice,
          value: sendTx.value,
        };

        // Simulate a contract call with the transaction data at the block before the transaction
        const messageId = await provider.call(call, receipt.blockNumber - 1);

        console.log(
          `\n✅ ${amountToBridge} of Tokens(${tokenAddress}) Sent to account ${destinationAccount} on destination chain ${destinationChain} using CCIP. Transaction hash ${sendTx.hash} -  Message id is ${messageId}`
        );

        setMainTxState({
          txHash: sendTx.hash,
          loading: false,
          success: true,
        });

        addTransaction(sendTx.hash, {
          action,
          txState: 'success',
          asset: tokenAddress,
          amount: amountToBridge,
          assetName: symbol,
        });

        // queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        // refetchPoolData && refetchPoolData();
        // refetchIncentiveData && refetchIncentiveData();
      } catch (error) {
        console.log('DO WE ERROR --->', error);

        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToBridge}
        symbol={symbol}
        // preparingTransactions={loadingTxns}
        preparingTransactions={loadingTxns}
        actionText={<Trans>Bridge {symbol}</Trans>}
        actionInProgressText={<Trans>Bridging {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={false} // how to check permitAvailable for gho?
        sx={sx}
        {...props}
      />
    );
  }
);
