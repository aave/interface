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
// import { TxSuccessView } from './Success';

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
  hideTitleSymbol?: boolean;
  children: (props: ModalWrapperProps) => React.ReactNode;
}> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  keepWrappedSymbol,
}) => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { walletBalances } = useWalletBalances();
  const { currentChainId: marketChainId, currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves } = useAppDataContext();
  const { txError, mainTxState } = useModalContext();

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  const requiredChainId = _requiredChainId ? _requiredChainId : marketChainId;
  const isWrongNetwork = connectedChainId !== requiredChainId;

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve.isWrappedBaseAsset;
    return underlyingAsset === reserve.underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user?.userReservesData.find((userReserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return userReserve.reserve.isWrappedBaseAsset;
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserveData;

  const symbol =
    poolReserve.isWrappedBaseAsset && !keepWrappedSymbol
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserve.symbol;

  // if (mainTxState.success) {
  //   return <TxSuccessView symbol={symbol} />;
  // }
  return (
    <>
      {!mainTxState.success && (
        <TxModalTitle title={title} symbol={hideTitleSymbol ? undefined : symbol} />
      )}
      {isWrongNetwork && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
        />
      )}
      {children({
        isWrongNetwork,
        nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()].amount,
        tokenBalance: walletBalances[userReserve.reserve.underlyingAsset].amount,
        poolReserve,
        symbol,
        underlyingAsset,
        userReserve,
      })}
    </>
  );
};
