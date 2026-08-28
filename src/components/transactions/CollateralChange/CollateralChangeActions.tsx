import { ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Contract, PopulatedTransaction } from 'ethers';
import React from 'react';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { usePoolSupportsMulticall } from 'src/hooks/pool/usePoolSupportsMulticall';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

// Minimal ABI for Pool multicall + setUserEMode + setUserUseReserveAsCollateral
const POOL_MULTICALL_ABI = [
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'function setUserEMode(uint8 categoryId)',
  'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
];

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  usageAsCollateral: boolean;
  blocked: boolean;
  symbol: string;
  selectedEmodeId?: number;
};

export const CollateralChangeActions = ({
  poolReserve,
  isWrongNetwork,
  usageAsCollateral,
  blocked,
  symbol,
  selectedEmodeId,
}: CollateralChangeActionsProps) => {
  const [setUsageAsCollateral, setUserEMode, estimateGasLimit, currentMarketData] = useRootStore(
    useShallow((state) => [
      state.setUsageAsCollateral,
      state.setUserEMode,
      state.estimateGasLimit,
      state.currentMarketData,
    ])
  );
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const { mainTxState, setMainTxState, setTxError } = useModalContext();
  // Resolved on modal open so it is cached well before the user picks an e-mode.
  const { data: poolSupportsMulticall } = usePoolSupportsMulticall(currentMarketData);

  const needsEmodeSwitch = selectedEmodeId !== undefined;

  const {
    action,
    loadingTxns,
    mainTxState: handlerTxState,
    requiresApproval,
  } = useTransactionHandler({
    tryPermit: false,
    protocolAction: ProtocolAction.setUsageAsCollateral,
    eventTxInfo: {
      assetName: poolReserve.name,
      asset: poolReserve.underlyingAsset,
      previousState: (!usageAsCollateral).toString(),
      newState: usageAsCollateral.toString(),
    },

    handleGetTxns: async () => {
      return setUsageAsCollateral({
        reserve: poolReserve.underlyingAsset,
        usageAsCollateral,
      });
    },
    skip: blocked || needsEmodeSwitch,
  });

  // setUserEMode + setUserUseReserveAsCollateral, bundled via Pool.multicall
  // where the pool supports it and sent sequentially where it does not.
  const emodeAction = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;

      if (poolSupportsMulticall) {
        const poolContractAddress = currentMarketData.addresses.LENDING_POOL;
        const poolInterface = new Contract(poolContractAddress, POOL_MULTICALL_ABI).interface;
        const currentAccount = useRootStore.getState().account;

        const setEModeCalldata = poolInterface.encodeFunctionData('setUserEMode', [
          selectedEmodeId,
        ]);

        const setCollateralCalldata = poolInterface.encodeFunctionData(
          'setUserUseReserveAsCollateral',
          [poolReserve.underlyingAsset, usageAsCollateral]
        );

        let multicallTxData = await new Contract(
          poolContractAddress,
          POOL_MULTICALL_ABI
        ).populateTransaction.multicall([setEModeCalldata, setCollateralCalldata]);
        multicallTxData = { ...multicallTxData, from: currentAccount };
        multicallTxData = await estimateGasLimit(multicallTxData);
        response = await sendTx(multicallTxData);
      } else {
        // Pools below POOL_REVISION 8 have no multicall — send the two calls
        // one after the other instead.
        const eModeTxs = await setUserEMode(selectedEmodeId as number);
        const eModeTx = await eModeTxs[0].tx();
        const eModeTxWithGas = await estimateGasLimit(eModeTx as PopulatedTransaction);
        const eModeResponse = await sendTx(eModeTxWithGas);
        await eModeResponse.wait(1);

        const collateralTxs = await setUsageAsCollateral({
          reserve: poolReserve.underlyingAsset,
          usageAsCollateral,
        });
        const collateralTx = await collateralTxs[0].tx();
        const collateralTxWithGas = await estimateGasLimit(collateralTx as PopulatedTransaction);
        response = await sendTx(collateralTxWithGas);
      }

      await response.wait(1);

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
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

  const txState = needsEmodeSwitch ? mainTxState : handlerTxState;

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={needsEmodeSwitch ? false : loadingTxns}
      mainTxState={txState}
      isWrongNetwork={isWrongNetwork}
      actionText={
        usageAsCollateral ? (
          <Trans>Enable {symbol} as collateral</Trans>
        ) : (
          <Trans>Disable {symbol} as collateral</Trans>
        )
      }
      actionInProgressText={<Trans>Pending...</Trans>}
      handleAction={needsEmodeSwitch ? emodeAction : action}
    />
  );
};
