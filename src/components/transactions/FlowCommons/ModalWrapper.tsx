import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useAppDataContextTonNetwork } from 'src/hooks/useAppDataContextTonNetwork';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

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
  action?: string;
}

export const ModalWrapper: React.FC<{
  underlyingAsset: string;
  title: ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  hideTitleSymbol?: boolean;
  children: (props: ModalWrapperProps) => React.ReactNode;
  action?: string;
}> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  keepWrappedSymbol,
}) => {
  const { readOnlyModeAddress } = useWeb3Context();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { user, reserves } = useAppDataContext();

  const { isConnectedTonWallet } = useTonConnectContext();
  const { symbolTon, userReserveTon, walletBalancesTon, reservesTon } =
    useAppDataContextTonNetwork();
  const { txError, mainTxState } = useModalContext();

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork(_requiredChainId);

  const isWrongNetworkMatch = isConnectedTonWallet ? false : isWrongNetwork;

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  const poolReserveTon = reservesTon?.find((reserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve.isWrappedBaseAsset;
    return underlyingAsset === reserve.underlyingAsset;
  }) as ComputedReserveData;

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve.isWrappedBaseAsset;
    return underlyingAsset === reserve.underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = isConnectedTonWallet
    ? userReserveTon
    : (user?.userReservesData.find((userReserve) => {
        if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
          return userReserve.reserve.isWrappedBaseAsset;
        return underlyingAsset === userReserve.underlyingAsset;
      }) as ComputedUserReserveData);

  const symbol = isConnectedTonWallet
    ? symbolTon
    : poolReserve.isWrappedBaseAsset && !keepWrappedSymbol
    ? currentNetworkConfig.baseAssetSymbol
    : poolReserve.symbol;

  const tokenBalance =
    (isConnectedTonWallet && poolReserveTon && walletBalancesTon
      ? walletBalancesTon[poolReserveTon?.underlyingAsset?.toLowerCase()]?.amount
      : walletBalances[poolReserve?.underlyingAsset?.toLowerCase()]?.amount) || '0';

  const dataPoolReserveMatch =
    isConnectedTonWallet && poolReserveTon ? poolReserveTon : poolReserve;

  console.log('user----------', user);
  console.log(
    'tokenBalance----------',
    poolReserveTon,
    poolReserve,
    dataPoolReserveMatch,
    isConnectedTonWallet
  );

  return (
    <AssetCapsProvider asset={dataPoolReserveMatch}>
      {!mainTxState.success && (
        <TxModalTitle title={title} symbol={hideTitleSymbol ? undefined : symbol} />
      )}
      {isWrongNetworkMatch && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
            eventParams: {
              asset: underlyingAsset,
            },
          }}
        />
      )}
      {children({
        isWrongNetwork: isWrongNetworkMatch,
        nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
        tokenBalance: tokenBalance,
        poolReserve: dataPoolReserveMatch,
        symbol,
        underlyingAsset,
        userReserve,
      })}
    </AssetCapsProvider>
  );
};
