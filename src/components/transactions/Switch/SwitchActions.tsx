import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import {
  calculateUniqueOrderId,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  SupportedChainId,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber, ethers } from 'ethers';
import { defaultAbiCoder, splitSignature } from 'ethers/lib/utils';
import stringify from 'json-stringify-deterministic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSmartContractWallet } from 'src/helpers/provider';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useParaswapSellTxParams } from 'src/hooks/paraswap/useParaswapRates';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';
import { needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from '../utils';
import {
  COW_APP_DATA,
  getPreSignTransaction,
  getUnsignerOrder,
  isNativeToken,
  populateEthFlowTx,
  sendOrder,
  uploadAppData,
} from './cowprotocol.helpers';
import { isCowProtocolRates, isParaswapRates, SwitchRatesType } from './switch.types';

interface SwitchProps {
  inputAmount: string;
  inputToken: string;
  outputToken: string;
  setShowUSDTResetWarning: (showUSDTResetWarning: boolean) => void;
  slippage: string;
  blocked: boolean;
  loading?: boolean;
  isWrongNetwork: boolean;
  chainId: number;
  switchRates?: SwitchRatesType;
  inputSymbol: string;
  outputSymbol: string;
  setShowGasStation: (showGasStation: boolean) => void;
}

interface SignedParams {
  signature: string;
  deadline: string;
  amount: string;
  approvedToken: string;
}

export const SwitchActions = ({
  inputAmount,
  inputToken,
  outputToken,
  inputSymbol,
  outputSymbol,
  setShowUSDTResetWarning,
  slippage: slippageInPercent,
  blocked,
  loading,
  isWrongNetwork,
  chainId,
  switchRates,
  setShowGasStation,
}: SwitchProps) => {
  const [
    user,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    addTransaction,
    currentMarketData,
    trackEvent,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.generateSignatureRequest,
      state.addTransaction,
      state.currentMarketData,
      state.trackEvent,
    ])
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

  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();
  const networkConfig = getNetworkConfig(chainId);

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
  const { mutateAsync: fetchParaswapTxParams } = useParaswapSellTxParams(
    networkConfig.underlyingChainId ?? chainId
  );
  const tryPermit =
    permitByChainAndToken[chainId]?.[inputToken] && switchRates?.provider !== 'cowprotocol';

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT && tryPermit;

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      inputAmount === '0' ||
      isWrongNetwork
    )
      return false;
    else return approvedAmount < Number(inputAmount);
  }, [approvedAmount, inputAmount, isWrongNetwork]);
  const [requiresApprovalReset, setRequiresApprovalReset] = useState(false);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    if (!switchRates) {
      return;
    }

    const amountToApprove = calculateSignedAmount(inputAmount, switchRates.srcDecimals, 0);
    const currentApproved = calculateSignedAmount(
      approvedAmount?.toString() || '0',
      switchRates.srcDecimals,
      0
    );

    if (needsUSDTApprovalReset(inputSymbol, chainId, currentApproved, amountToApprove)) {
      setShowUSDTResetWarning(true);
      setRequiresApprovalReset(true);
    } else {
      setShowUSDTResetWarning(false);
      setRequiresApprovalReset(false);
    }
  }, [inputSymbol, chainId, approvedAmount, inputAmount, setShowUSDTResetWarning, switchRates]);

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    if (isParaswapRates(switchRates)) {
      try {
        const tx = await fetchParaswapTxParams({
          srcToken: inputToken,
          srcDecimals: switchRates.srcDecimals,
          destDecimals: switchRates.destDecimals,
          destToken: outputToken,
          route: switchRates.optimalRateData,
          user,
          maxSlippage: Number(slippageInPercent) * 10000,
          permit: signatureParams && signatureParams.signature,
          deadline: signatureParams && signatureParams.deadline,
          partner: 'aave-widget',
        });
        tx.chainId = chainId;
        const txWithGasEstimation = await estimateGasLimit(tx, chainId);
        const response = await sendTx(txWithGasEstimation);
        try {
          await response.wait(1);
          addTransaction(
            response.hash,
            {
              txState: 'success',
            },
            {
              chainId,
            }
          );
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.poolTokens(user, currentMarketData),
          });
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
          setTxError(parsedError);
          setMainTxState({
            txHash: response.hash,
            loading: false,
          });
          addTransaction(
            response.hash,
            {
              txState: 'failed',
            },
            {
              chainId,
            }
          );
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    } else if (isCowProtocolRates(switchRates)) {
      try {
        const provider = await getEthersProvider(wagmiConfig, { chainId });
        const destAmountWithSlippage = valueToBigNumber(switchRates.destAmount)
          .multipliedBy(valueToBigNumber(1).minus(valueToBigNumber(slippageInPercent)))
          .toFixed(0);
        const slippageBps = Math.round(Number(slippageInPercent) * 100 * 100); // percent to bps
        const smartSlippage = switchRates.suggestedSlippage == Number(slippageInPercent) * 100;

        // If srcToken is native, we need to use the eth-flow instead of the orderbook
        if (isNativeToken(inputToken)) {
          const validTo = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes
          const ethFlowTx = await populateEthFlowTx(
            switchRates.srcAmount,
            destAmountWithSlippage.toString(),
            outputToken,
            user,
            validTo,
            inputSymbol,
            outputSymbol,
            slippageBps,
            smartSlippage,
            switchRates.quoteId
          );
          const txWithGasEstimation = await estimateGasLimit(ethFlowTx, chainId);
          let response;
          try {
            response = await sendTx(txWithGasEstimation);
            addTransaction(
              response.hash,
              {
                txState: 'success',
              },
              {
                chainId,
              }
            );

            setMainTxState({
              loading: false,
              success: true,
            });

            const unsignerOrder = await getUnsignerOrder(
              switchRates.srcAmount,
              destAmountWithSlippage.toString(),
              outputToken,
              user,
              chainId,
              inputSymbol,
              outputSymbol,
              slippageBps,
              smartSlippage
            );
            const calculatedOrderId = await calculateUniqueOrderId(chainId, unsignerOrder);

            await uploadAppData(
              calculatedOrderId,
              stringify(COW_APP_DATA(inputSymbol, outputSymbol, slippageBps, smartSlippage)),
              chainId
            );

            // CoW takes some time to index the order for 'eth-flow' orders
            setTimeout(() => {
              setMainTxState({
                loading: false,
                success: true,
                txHash: calculatedOrderId,
              });
            }, 1000 * 30); // 30 seconds - if we set less than 30 seconds, the order is not indexed yet and CoW explorer will not find the order
          } catch (error) {
            setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, false));
            setMainTxState({
              txHash: response?.hash,
              loading: false,
            });
            if (response?.hash) {
              addTransaction(
                response?.hash,
                {
                  txState: 'failed',
                },
                { chainId }
              );
            }
          }
        } else {
          let orderId;
          try {
            if (await isSmartContractWallet(user, provider)) {
              const preSignTransaction = await getPreSignTransaction({
                provider,
                tokenDest: outputToken,
                chainId,
                user,
                amount: switchRates.srcAmount,
                tokenSrc: inputToken,
                tokenSrcDecimals: switchRates.srcDecimals,
                tokenDestDecimals: switchRates.destDecimals,
                afterNetworkCostsBuyAmount:
                  switchRates.amountAndCosts.afterNetworkCosts.buyAmount.toString(),
                slippageBps,
                smartSlippage,
                inputSymbol,
                outputSymbol,
                quote: switchRates.order,
              });

              const response = await sendTx({
                data: preSignTransaction.data,
                to: preSignTransaction.to,
                value: BigNumber.from(preSignTransaction.value),
                gasLimit: BigNumber.from(preSignTransaction.gasLimit),
              });

              addTransaction(
                response.hash,
                {
                  txState: 'success',
                },
                {
                  chainId,
                }
              );

              setMainTxState({
                loading: false,
                success: true,
                txHash: preSignTransaction.orderId,
              });
            } else {
              orderId = await sendOrder({
                tokenSrc: inputToken,
                tokenSrcDecimals: switchRates.srcDecimals,
                tokenDest: outputToken,
                tokenDestDecimals: switchRates.destDecimals,
                quote: switchRates.order,
                amount: switchRates.srcAmount,
                afterNetworkCostsBuyAmount:
                  switchRates.amountAndCosts.afterNetworkCosts.buyAmount.toString(),
                slippageBps,
                smartSlippage,
                chainId,
                user,
                provider,
                inputSymbol,
                outputSymbol,
              });
              setMainTxState({
                loading: false,
                success: true,
                txHash: orderId ?? undefined,
              });
            }
          } catch (error) {
            console.error(error);
            const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
            setTxError(parsedError);
            setMainTxState({
              success: false,
              loading: false,
            });
          }
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
    }

    try {
      trackEvent(GENERAL.SWAP, {
        chainId,
        inputSymbol,
        outputSymbol,
        pair: `${inputSymbol}-${outputSymbol}`,
      });
    } catch (error) {
      console.error(error);
    }

    // Invalidate the pool tokens query to refresh the data
    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.poolTokens(user, findByChainId(chainId) ?? currentMarketData),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.transactionHistory(
        user,
        findByChainId(chainId) ?? currentMarketData
      ),
    });
  };

  const approval = async () => {
    let spender;
    if (isParaswapRates(switchRates)) {
      spender = switchRates.optimalRateData.tokenTransferProxy;
    } else if (isCowProtocolRates(switchRates)) {
      spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId];
    } else {
      // Error
      const parsedError = getErrorTextFromError(
        new Error('Invalid swap provider rates.'),
        TxAction.APPROVAL,
        false
      );

      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
      return;
    }

    const amountToApprove = calculateSignedAmount(inputAmount, switchRates.srcDecimals, 0);

    if (requiresApprovalReset) {
      const resetData = {
        spender,
        user,
        token: inputToken,
        amount: '0',
      };

      try {
        if (useSignature) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateSignatureRequest(
            {
              ...resetData,
              deadline,
            },
            { chainId }
          );
          setApprovalTxState({ ...approvalTxState, loading: true });
          const response = await signTxData(signatureRequest);
          const splitedSignature = splitSignature(response);
          const encodedSignature = defaultAbiCoder.encode(
            ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
            [
              resetData.user,
              resetData.spender,
              resetData.amount,
              deadline,
              splitedSignature.v,
              splitedSignature.r,
              splitedSignature.s,
            ]
          );
          setSignatureParams({
            signature: encodedSignature,
            deadline,
            amount: resetData.amount,
            approvedToken: resetData.spender,
          });
        } else {
          // Create direct ERC20 approval transaction for reset to 0 as ERC20Service requires positive amount
          const abi = new ethers.utils.Interface([
            'function approve(address spender, uint256 amount)',
          ]);
          const encodedData = abi.encodeFunctionData('approve', [spender, '0']);
          const resetTx = {
            data: encodedData,
            to: inputToken,
            from: user,
          };
          const resetTxWithGasEstimation = await estimateGasLimit(resetTx, chainId);
          setApprovalTxState({ ...approvalTxState, loading: true });
          const resetResponse = await sendTx(resetTxWithGasEstimation);
          await resetResponse.wait(1);
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        console.error(parsedError);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
      fetchApprovedAmount().then(() => {
        setApprovalTxState({
          loading: false,
          success: false,
        });
      });

      return;
    }

    const approvalData = {
      spender,
      user,
      token: inputToken,
      amount: amountToApprove,
    };
    try {
      if (useSignature) {
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        const signatureRequest = await generateSignatureRequest(
          {
            ...approvalData,
            deadline,
          },
          { chainId }
        );
        setApprovalTxState({ ...approvalTxState, loading: true });
        const response = await signTxData(signatureRequest);
        const splitedSignature = splitSignature(response);
        const encodedSignature = defaultAbiCoder.encode(
          ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
          [
            approvalData.user,
            approvalData.spender,
            approvalData.amount,
            deadline,
            splitedSignature.v,
            splitedSignature.r,
            splitedSignature.s,
          ]
        );
        setSignatureParams({
          signature: encodedSignature,
          deadline,
          amount: approvalData.amount,
          approvedToken: approvalData.spender,
        });
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
        });
      } else {
        const tx = generateApproval(approvalData, { chainId, amount: amountToApprove });
        const txWithGasEstimation = await estimateGasLimit(tx, chainId);
        setApprovalTxState({ loading: true });
        const response = await sendTx(txWithGasEstimation);
        await response.wait(1);
        fetchApprovedAmount().then(() => {
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        });
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
      console.error(parsedError);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const fetchApprovedAmount = useCallback(async () => {
    if (isParaswapRates(switchRates) && switchRates.optimalRateData.tokenTransferProxy) {
      setSignatureParams(undefined);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
      setLoadingTxns(true);
      const rpc = getProvider(chainId);
      const erc20Service = new ERC20Service(rpc);
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user,
        token: inputToken,
        spender: switchRates.optimalRateData.tokenTransferProxy,
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    } else if (isCowProtocolRates(switchRates)) {
      // Check approval to VaultRelayer
      setSignatureParams(undefined);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
      setLoadingTxns(true);
      const rpc = getProvider(chainId);
      const erc20Service = new ERC20Service(rpc);
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user,
        token: inputToken,
        spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId],
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    }
  }, [chainId, setLoadingTxns, user, inputToken, switchRates, setApprovalTxState]);

  useEffect(() => {
    if (user) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, user]);

  useEffect(() => {
    let switchGasLimit = 0;
    if (isParaswapRates(switchRates)) {
      switchGasLimit += Number(
        gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended
      );
    }
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVAL_GAS_LIMIT);
      if (requiresApprovalReset) {
        switchGasLimit += Number(APPROVAL_GAS_LIMIT); // Reset approval
      }
    }
    if (isNativeToken(inputToken)) {
      switchGasLimit += Number(
        gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended
      );
    }
    setGasLimit(switchGasLimit.toString());
    setShowGasStation(requiresApproval || isNativeToken(inputToken));
  }, [requiresApproval, approvalTxState, setGasLimit, setShowGasStation, requiresApprovalReset]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={inputAmount}
      handleApproval={() => approval()}
      requiresApproval={!blocked && requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: blocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={tryPermit}
    />
  );
};
