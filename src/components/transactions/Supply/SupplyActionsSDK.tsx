import { bigDecimal, chainId as sdkChainId, evmAddress } from '@aave/client';
import { supply } from '@aave/client/actions';
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
import React, { useEffect } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getWalletClient } from 'wagmi/actions';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionPropsSDK extends BoxProps {
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
}

export const SupplyActionsSDK = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    chainId,
    ...props
  }: SupplyActionPropsSDK) => {
    const [addTransaction, currentMarketData] = useRootStore(
      useShallow((state) => [state.addTransaction, state.currentMarketData])
    );
    const { supplyReserves } = useAppDataContext();
    const { mainTxState, loadingTxns, setLoadingTxns, setMainTxState, setGasLimit, setTxError } =
      useModalContext();
    const { currentAccount, chainId: userChainId } = useWeb3Context();
    const queryClient = useQueryClient();

    const isNativeSupply = poolAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

    useEffect(() => {
      setGasLimit(String(gasLimitRecommendations[ProtocolAction.supply].recommended));
    }, [setGasLimit]);

    const handleAction = async () => {
      if (!currentAccount || !amountToSupply || Number(amountToSupply) === 0) return;

      try {
        setLoadingTxns(true);
        setMainTxState({ ...mainTxState, loading: true });
        setTxError(undefined);

        const walletClient = await getWalletClient(wagmiConfig, {
          chainId: chainId ?? currentMarketData.chainId ?? userChainId,
        });

        if (!walletClient) {
          throw new Error('Wallet client not available');
        }

        const amountInput = isNativeSupply
          ? { native: bigDecimal(amountToSupply) }
          : {
              erc20: {
                currency: evmAddress(poolAddress),
                value: bigDecimal(amountToSupply),
                permitSig: null,
              },
            };

        const result = await supply(client, {
          market: evmAddress(currentMarketData.addresses.LENDING_POOL),
          amount: amountInput,
          sender: evmAddress(currentAccount),
          onBehalfOf: evmAddress(currentAccount),
          chainId: sdkChainId(chainId ?? currentMarketData.chainId),
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
          action: ProtocolAction.supply,
          txState: 'success',
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
          amountUsd: (() => {
            const reserve = supplyReserves.find(
              (r) => r.underlyingToken.address.toLowerCase() === poolAddress.toLowerCase()
            );
            return reserve
              ? valueToBigNumber(amountToSupply).multipliedBy(reserve.usdExchangeRate).toString()
              : undefined;
          })(),
        });

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
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
        approvalTxState={{}}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleAction={handleAction}
        requiresApproval={false}
        tryPermit={false}
        sx={sx}
        {...props}
      />
    );
  }
);
