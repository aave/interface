import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { MarketUserState } from '@aave/graphql/import';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxErrorView } from './Error';
import { TxModalTitle } from './TxModalTitle';

export interface ModalWrapperSDKProps {
  underlyingAsset: string;
  poolReserve: ReserveWithId;
  reserveUserState?: ReserveWithId['userState'];
  marketUserState?: MarketUserState | null;
  symbol: string;
  tokenBalance: string;
  nativeBalance: string;
  isWrongNetwork: boolean;
  action?: string;
}

export const ModalWrapperSDK: React.FC<{
  underlyingAsset: string;
  title: ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  hideTitleSymbol?: boolean;
  children: (props: ModalWrapperSDKProps) => React.ReactNode;
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
  const { supplyReserves, borrowReserves, market: sdkMarket } = useAppDataContext();
  const { txError, mainTxState } = useModalContext();

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork(_requiredChainId);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  const addr = underlyingAsset.toLowerCase();
  const poolReserveSDK =
    supplyReserves.find((reserve) =>
      addr === API_ETH_MOCK_ADDRESS.toLowerCase()
        ? !!reserve.acceptsNative
        : addr === reserve.underlyingToken.address.toLowerCase()
    ) ||
    borrowReserves.find((reserve) =>
      addr === API_ETH_MOCK_ADDRESS.toLowerCase()
        ? !!reserve.acceptsNative
        : addr === reserve.underlyingToken.address.toLowerCase()
    );

  if (!poolReserveSDK) throw new Error(`Reserve not found for ${underlyingAsset}`);

  //!Debug
  console.log('poolReserveSDK', poolReserveSDK);

  const reserveUserState = poolReserveSDK.userState;
  const marketUserState = sdkMarket?.userState;

  const symbol =
    poolReserveSDK.acceptsNative && !keepWrappedSymbol
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserveSDK.underlyingToken.symbol;
  //!Para balacne nativo, no se si esto esta correcto
  const nativeKey = API_ETH_MOCK_ADDRESS.toLowerCase();
  const tokenKey = poolReserveSDK.underlyingToken.address.toLowerCase();
  const nativeBalance = walletBalances[nativeKey]?.amount || '0';
  const tokenBalance =
    addr === nativeKey && poolReserveSDK.acceptsNative
      ? nativeBalance
      : walletBalances[tokenKey]?.amount || '0';
  return (
    <AssetCapsProviderSDK asset={poolReserveSDK}>
      {!mainTxState.success && (
        <TxModalTitle title={title} symbol={hideTitleSymbol ? undefined : symbol} />
      )}
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
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
        isWrongNetwork,
        nativeBalance,
        tokenBalance,
        //!esto es lo que habia, lo he cambiado por lo de arriba como recomendacion para ensenar el correcto balance
        // nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
        // tokenBalance:
        //   walletBalances[poolReserveSDK.underlyingToken.address.toLowerCase()]?.amount || '0',
        poolReserve: poolReserveSDK,
        symbol,
        underlyingAsset,
        reserveUserState: reserveUserState,
        marketUserState: marketUserState,
      })}
    </AssetCapsProviderSDK>
  );
};
