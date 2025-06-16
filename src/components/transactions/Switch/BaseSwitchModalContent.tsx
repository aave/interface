import React, { useState } from 'react';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';
import { ModalType } from 'src/hooks/useModal';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { supportedNetworksWithEnabledMarket, SupportedNetworkWithChainId } from './common';
import { LimitSwitch } from './LimitSwitch';
import { MarketSwitch } from './MarketSwitch';
import { SwitchProvider, SwitchRatesType } from './switch.types';
import { SwitchType, SwitchTypeSelector } from './SwitchTypeSelector';

export type SwitchDetailsParams = Parameters<
  NonNullable<SwitchModalCustomizableProps['switchDetails']>
>[0];

export const getFilteredTokensForSwitch = (chainId: number): TokenInfoWithBalance[] => {
  let customTokenList = TOKEN_LIST.tokens;
  const savedCustomTokens = localStorage.getItem('customTokens');
  if (savedCustomTokens) {
    customTokenList = customTokenList.concat(JSON.parse(savedCustomTokens));
  }

  const transformedTokens = customTokenList.map((token) => {
    return { ...token, balance: '0' };
  });
  const realChainId = getNetworkConfig(chainId).underlyingChainId ?? chainId;
  return transformedTokens.filter((token) => token.chainId === realChainId);
};
export interface SwitchModalCustomizableProps {
  modalType: ModalType;
  switchDetails?: ({
    user,
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    selectedInputToken,
    safeSlippage,
    maxSlippage,
    switchProvider,
    ratesLoading,
    ratesError,
    showGasStation,
  }: {
    user: string;
    switchRates: SwitchRatesType;
    gasLimit: string;
    selectedChainId: number;
    selectedOutputToken: TokenInfoWithBalance;
    selectedInputToken: TokenInfoWithBalance;
    safeSlippage: number;
    maxSlippage: number;
    switchProvider?: SwitchProvider;
    ratesLoading: boolean;
    ratesError: Error | null;
    showGasStation?: boolean;
  }) => React.ReactNode;
  inputBalanceTitle?: string;
  outputBalanceTitle?: string;
  tokensFrom?: TokenInfoWithBalance[];
  tokensTo?: TokenInfoWithBalance[];
  forcedDefaultInputToken?: TokenInfoWithBalance;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
}

export const BaseSwitchModalContent = ({
  showTitle = true,
  forcedDefaultInputToken,
  forcedChainId,
  forcedDefaultOutputToken,
  modalType,
  inputBalanceTitle,
  initialFromTokens,
  initialToTokens,
}: {
  showTitle?: boolean;
  forcedChainId: number;
  showSwitchInputAndOutputAssetsButton?: boolean;
  forcedDefaultInputToken?: TokenInfoWithBalance;
  initialFromTokens: TokenInfoWithBalance[];
  initialToTokens: TokenInfoWithBalance[];
  forcedDefaultOutputToken?: TokenInfoWithBalance;
  supportedNetworks: SupportedNetworkWithChainId[];
  showChangeNetworkWarning?: boolean;
} & SwitchModalCustomizableProps) => {
  const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === forcedChainId))
      return forcedChainId;
    return defaultNetwork.chainId;
  });
  const switchProvider = useSwitchProvider({ chainId: selectedChainId });
  const [switchType, setSwitchType] = useState(SwitchType.SWAP);

  return (
    <>
      {showTitle && <TxModalTitle title={`Swap Assets`} />}

      {switchProvider === 'cowprotocol' && (
        <SwitchTypeSelector switchType={switchType} setSwitchType={setSwitchType} />
      )}

      {switchType === SwitchType.SWAP ? (
        <MarketSwitch
          forcedChainId={selectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          initialFromTokens={initialFromTokens}
          initialToTokens={initialToTokens}
          modalType={modalType}
          inputBalanceTitle={inputBalanceTitle}
          forcedDefaultInputToken={forcedDefaultInputToken}
          forcedDefaultOutputToken={forcedDefaultOutputToken}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
        />
      ) : (
        <LimitSwitch
          forcedChainId={selectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          initialFromTokens={initialFromTokens}
          initialToTokens={initialToTokens}
          modalType={modalType}
          inputBalanceTitle={inputBalanceTitle}
          forcedDefaultInputToken={forcedDefaultInputToken}
          forcedDefaultOutputToken={forcedDefaultOutputToken}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
        />
      )}
    </>
  );
};
