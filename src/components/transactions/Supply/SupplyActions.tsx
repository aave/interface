import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Contract, PopulatedTransaction } from 'ethers';
import { parseUnits, splitSignature } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

// Minimal ABI for Pool multicall + setUserEMode + supply
const POOL_MULTICALL_ABI = [
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function setUserEMode(uint8 categoryId)',
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function supplyWithPermit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
];

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  setShowUSDTResetWarning?: (showUSDTResetWarning: boolean) => void;
  chainId?: number;
  selectedEmodeId?: number;
}

export const SupplyActions = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    setShowUSDTResetWarning,
    chainId,
    selectedEmodeId,
    ...props
  }: SupplyActionProps) => {
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      setUserEMode,
      walletApprovalMethodPreference,
      estimateGasLimit,
      addTransaction,
      currentMarketData,
    ] = useRootStore(
      useShallow((state) => [
        state.tryPermit,
        state.supply,
        state.supplyWithPermit,
        state.setUserEMode,
        state.walletApprovalMethodPreference,
        state.estimateGasLimit,
        state.addTransaction,
        state.currentMarketData,
      ])
    );
    const { reserves } = useAppDataContext();
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
    const permitAvailable = tryPermit({ reserveAddress: poolAddress, isWrappedBaseAsset });
    const { sendTx } = useWeb3Context();
    const queryClient = useQueryClient();

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isRefetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = usePoolApprovedAmount(currentMarketData, poolAddress);

    setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToSupply) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount?.amount || '0',
        amount: amountToSupply,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

    const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    const { approval, requiresApprovalReset } = useApprovalTx({
      usePermit,
      approvedAmount,
      requiresApproval,
      assetAddress: poolAddress,
      symbol,
      decimals,
      signatureAmount: amountToSupply,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
      chainId,
      setShowUSDTResetWarning,
    });

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

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
      // Add gas for setUserEMode if bundling e-mode switch
      if (selectedEmodeId !== undefined) {
        supplyGasLimit += 100000;
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit, selectedEmodeId]);

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });

        let response: TransactionResponse;
        let action = ProtocolAction.default;

        const needsEmodeSwitch = selectedEmodeId !== undefined;
        const isNativeAsset = poolAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

        if (needsEmodeSwitch) {
          if (isNativeAsset) {
            // Native ETH goes through WETH Gateway which is a separate contract —
            // can't bundle with Pool.multicall. Send setUserEMode first, then supply.
            const eModeTxs = await setUserEMode(selectedEmodeId);
            const eModeTx = await eModeTxs[0].tx();
            const eModeTxWithGas = await estimateGasLimit(eModeTx as PopulatedTransaction);
            const eModeResponse = await sendTx(eModeTxWithGas);
            await eModeResponse.wait(1);

            action = ProtocolAction.supply;
            let supplyTxData = supply({
              amount: parseUnits(amountToSupply, decimals).toString(),
              reserve: poolAddress,
            });
            supplyTxData = await estimateGasLimit(supplyTxData);
            response = await sendTx(supplyTxData);
            await response.wait(1);
          } else {
            // ERC20: Bundle setUserEMode + supply via Pool multicall
            const poolContractAddress = currentMarketData.addresses.LENDING_POOL;
            const poolInterface = new Contract(poolContractAddress, POOL_MULTICALL_ABI).interface;
            const currentAccount = useRootStore.getState().account;

            const setEModeCalldata = poolInterface.encodeFunctionData('setUserEMode', [
              selectedEmodeId,
            ]);

            let supplyCalldata: string;
            if (usePermit && signatureParams) {
              action = ProtocolAction.supplyWithPermit;
              const sig = splitSignature(signatureParams.signature);
              supplyCalldata = poolInterface.encodeFunctionData('supplyWithPermit', [
                poolAddress,
                parseUnits(amountToSupply, decimals).toString(),
                currentAccount,
                0,
                signatureParams.deadline,
                sig.v,
                sig.r,
                sig.s,
              ]);
            } else {
              action = ProtocolAction.supply;
              supplyCalldata = poolInterface.encodeFunctionData('supply', [
                poolAddress,
                parseUnits(amountToSupply, decimals).toString(),
                currentAccount,
                0,
              ]);
            }

            let multicallTxData = await new Contract(
              poolContractAddress,
              POOL_MULTICALL_ABI
            ).populateTransaction.multicall([setEModeCalldata, supplyCalldata]);
            multicallTxData = { ...multicallTxData, from: currentAccount };
            multicallTxData = await estimateGasLimit(multicallTxData);
            response = await sendTx(multicallTxData);
            await response.wait(1);
          }
        } else if (usePermit && signatureParams) {
          // Standard supply with permit (no e-mode switch)
          action = ProtocolAction.supplyWithPermit;
          let signedSupplyWithPermitTxData = supplyWithPermit({
            signature: signatureParams.signature,
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
            deadline: signatureParams.deadline,
          });

          signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
          response = await sendTx(signedSupplyWithPermitTxData);

          await response.wait(1);
        } else {
          // Standard supply (no e-mode switch)
          action = ProtocolAction.supply;
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          });
          supplyTxData = await estimateGasLimit(supplyTxData);
          response = await sendTx(supplyTxData);

          await response.wait(1);
        }

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        addTransaction(response.hash, {
          action,
          txState: 'success',
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
          amountUsd: (() => {
            const reserve = reserves.find((r) => r.underlyingAsset === poolAddress);
            return reserve
              ? valueToBigNumber(amountToSupply).multipliedBy(reserve.priceInUSD).toString()
              : undefined;
          })(),
        });

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      } catch (error) {
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
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns || !approvedAmount}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        sx={sx}
        {...props}
        requiresApprovalReset={requiresApprovalReset}
      />
    );
  }
);
