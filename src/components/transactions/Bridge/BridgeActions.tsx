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

export interface BridgeActionProps extends BoxProps {
  amountToBridge: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  sourceChain: string;
  destinationChain: {
    chainId: number;
  };
  destinationAccount: string;
  tokenAddress: any;
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
    ...props
  }: BridgeActionProps) => {
    const { provider } = useWeb3Context();

    const [
      tryPermit,
      supply,
      supplyWithPermit,
      walletApprovalMethodPreference,
      estimateGasLimit,
      addTransaction,
      currentMarketData,
    ] = useRootStore((state) => [
      state.tryPermit,
      state.supply,
      state.supplyWithPermit,
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

    // const { refetchPoolData, refetchIncentiveData } = useBackgroundDataProvider();
    // const permitAvailable = tryPermit({
    //   reserveAddress: poolAddress,
    //   isWrappedBaseAsset: isWrappedBaseAsset,
    // });
    const { sendTx } = useWeb3Context();

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isFetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = useApprovedAmount({
      marketData: currentMarketData,
      token: tokenAddress,
      spender: '0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59', // ETH SEPOLIA ROUTER
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

    console.log('usePermit', usePermit);

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    const { approval } = useApprovalTx({
      usePermit,
      approvedAmount: {
        amount: approvedAmount?.toString() || '0',
        user: user,
        token: tokenAddress,
        spender: '0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59', // ETH SEPOLIA ROUTER
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
        const sourceRouterAddress = getRouterConfig(sourceChain.chainId).address;
        const sourceChainSelector = getRouterConfig(sourceChain.chainId).chainSelector;
        // Get the chain selector for the target chain
        const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;
        const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

        // ==================================================
        //     Section: Check token validity
        //     Check first if the token you would like to
        //     transfer is supported.
        // ==================================================
        // */

        //   // Fetch the list of supported tokens

        //   console.log('destinationChainSelector', destinationChainSelector);

        const supportedTokens = await sourceRouter.getSupportedTokens(destinationChainSelector);

        const tokenAddressLower = tokenAddress.toLowerCase();

        // Convert each supported token to lowercase and check if the list includes the lowercase token address
        const isSupported = supportedTokens
          .map((token) => token.toLowerCase())
          .includes(tokenAddressLower);

        if (!isSupported) {
          throw Error(
            `Token address ${tokenAddress} not in the list of supportedTokens ${supportedTokens}`
          );
        }

        console.log('WE GET HERE');

        /*
  ==================================================
      Section: BUILD CCIP MESSAGE
      build CCIP message that you will send to the
      Router contract.
  ==================================================
  */

        // build message
        const tokenAmounts = [
          {
            token: tokenAddress,
            amount: amountToBridge,
          },
        ];

        // Encoding the data

        const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);
        //  "extraArgs" is a structure that can be represented as [ 'uint256']
        // extraArgs are { gasLimit: 0 }
        // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data

        const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);

        const encodedExtraArgs = functionSelector + extraArgs.slice(2);

        const message = {
          receiver: utils.defaultAbiCoder.encode(['address'], [destinationAccount]),
          data: '0x', // no data
          tokenAmounts: tokenAmounts,
          feeToken: constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.
          // feeToken: feeTokenAddress ? feeTokenAddress : ethers.constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.

          extraArgs: encodedExtraArgs,
        };

        /*
  ==================================================
      Section: CALCULATE THE FEES
      Call the Router to estimate the fees for sending tokens.
  ==================================================
  */

        const fees = await sourceRouter.getFee(destinationChainSelector, message);
        console.log(`Estimated fees (wei): ${fees}`);

        // console.log('ARE WE HERE -----', destinationChainSelector, message, fees);

        // console.log('SOURCE ROUTER ADDRESS', sourceRouterAddress);

        let approvalTx = await erc20.approve(sourceRouterAddress, amountToBridge);
        await approvalTx.wait();

        // let sendTxWithFeeData = sourceRouter.ccipSend(destinationChainSelector, message, {
        //   value: fees,
        // }); //

        // continue here, permit might not be needed

        let preparedTx = sourceRouter.ccipSend(destinationChainSelector, message, {
          value: fees,
        });

        console.log('1', preparedTx);
        // preparedTx = await estimateGasLimit(preparedTx);
        console.log('2');

        response = await preparedTx(preparedTx);

        console.log('3');

        await response.wait();
        console.log('4');

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        addTransaction(response.hash, {
          action: 'Bridge',
          txState: 'success',
          asset: tokenAddress,
          amount: amountToBridge,
          assetName: symbol,
        });

        alert('success');

        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval
        // if (usePermit && signatureParams) {
        //   action = ProtocolAction.supplyWithPermit;
        //   let signedSupplyWithPermitTxData = supplyWithPermit({
        //     signature: signatureParams.signature,
        //     amount: parseUnits(amountToBridge, decimals).toString(),
        //     reserve: poolAddress,
        //     deadline: signatureParams.deadline,
        //   });

        //   signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
        //   response = await sendTx(signedSupplyWithPermitTxData);

        //   await response.wait(1);
        // } else {
        //   action = ProtocolAction.supply;
        //   let supplyTxData = supply({
        //     amount: parseUnits(amountToBridge, decimals).toString(),
        //     reserve: poolAddress,
        //   });
        //   supplyTxData = await estimateGasLimit(supplyTxData);
        //   response = await sendTx(supplyTxData);

        //   await response.wait(1);
        // }

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        addTransaction(response.hash, {
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
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    // Check PROPS work correctly
    // Check apporval works
    // Handle action

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
        tryPermit={true} // how to check permitAvailable for gho?
        sx={sx}
        {...props}
      />
    );
  }
);
