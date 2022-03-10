import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxErrorView } from './Error';

export interface ModalWrapperProps {
  underlyingAsset: string;
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserveData;
  symbol: string;
  tokenBalance: string;
  nativeBalance: string;
  isWrongNetwork: boolean;
}

export const ModalWrapper: React.FC<{
  underlyingAsset: string;
  title: ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  children: (props: ModalWrapperProps) => React.ReactNode;
}> = ({
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  keepWrappedSymbol,
}) => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { walletBalances } = useWalletBalances();
  const { currentChainId: marketChainId, currentNetworkConfig } = useProtocolDataContext();
  const { user } = useAppDataContext();
  const { approvalTxState, mainTxState } = useModalContext();

  const requiredChainId = _requiredChainId ? _requiredChainId : marketChainId;
  const isWrongNetwork = connectedChainId !== requiredChainId;

  const userReserve = user?.userReservesData.find((userReserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return userReserve.reserve.isWrappedBaseAsset;
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserveData;

  const symbol =
    userReserve.reserve.isWrappedBaseAsset && !keepWrappedSymbol
      ? currentNetworkConfig.baseAssetSymbol
      : userReserve.reserve.symbol;
  return (
    <>
      <TxModalTitle title={title} symbol={symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
        />
      )}
      {mainTxState.txError || approvalTxState.txError ? (
        <TxErrorView errorMessage={(approvalTxState.txError || mainTxState.txError) as string} />
      ) : (
        children({
          isWrongNetwork,
          nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()].amount,
          tokenBalance: walletBalances[userReserve.reserve.underlyingAsset].amount,
          poolReserve: userReserve.reserve,
          symbol,
          underlyingAsset,
          userReserve,
        })
      )}
    </>
  );
};
