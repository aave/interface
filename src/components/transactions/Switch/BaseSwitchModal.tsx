import { Box, CircularProgress } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { supportedNetworksWithEnabledMarket } from 'src/components/transactions/Switch/common';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { BaseSwitchModalContent, SwitchModalCustomizableProps } from './BaseSwitchModalContent';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

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

  // Remove duplicates
  const seen = new Set<string>();
  return transformedTokens
    .filter((token) => token.chainId === realChainId)
    .filter((token) => {
      const key = `${token.chainId}:${token.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const BaseSwitchModal = ({
  modalType,
  inputBalanceTitle: balanceTitle,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
  tokensFrom: forcedTokensFrom,
  tokensTo: forcedTokensTo,
  showSwitchInputAndOutputAssetsButton = true,
  forcedChainId,
}: SwitchModalCustomizableProps) => {
  const {
    args: { chainId },
  } = useModalContext();

  const overallAppChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId } = useWeb3Context();
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (forcedChainId) {
      return forcedChainId;
    }
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === overallAppChainId))
      return overallAppChainId;
    return defaultNetwork.chainId;
  });

  useEffect(() => {
    if (forcedChainId) {
      setSelectedChainId(forcedChainId);
      return;
    }

    // Passing chainId as prop will set default network for switch modal
    if (chainId && supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === chainId)) {
      setSelectedChainId(chainId);
    } else if (
      connectedChainId &&
      supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === connectedChainId)
    ) {
      const supportedFork = supportedNetworksWithEnabledMarket.find(
        (elem) => elem.underlyingChainId === connectedChainId
      );
      setSelectedChainId(supportedFork ? supportedFork.chainId : connectedChainId);
    } else if (
      supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === overallAppChainId)
    ) {
      setSelectedChainId(overallAppChainId);
    } else {
      setSelectedChainId(defaultNetwork.chainId);
    }
  }, [overallAppChainId, chainId, connectedChainId, forcedChainId]);

  const initialDefaultTokens = useMemo(
    () => getFilteredTokensForSwitch(selectedChainId),
    [selectedChainId]
  );

  const {
    data: initialTokens,
    refetch: refetchInitialTokens,
    isFetching: tokensLoading,
  } = useTokensBalance(initialDefaultTokens, selectedChainId, user);

  if (tokensLoading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <BaseSwitchModalContent
        forcedChainId={selectedChainId}
        supportedNetworks={supportedNetworksWithEnabledMarket}
        initialFromTokens={forcedTokensFrom ?? initialTokens ?? []}
        initialToTokens={forcedTokensTo ?? initialTokens ?? []}
        modalType={modalType}
        inputBalanceTitle={balanceTitle}
        forcedDefaultInputToken={forcedDefaultInputToken}
        forcedDefaultOutputToken={forcedDefaultOutputToken}
        showSwitchInputAndOutputAssetsButton={showSwitchInputAndOutputAssetsButton}
        selectedChainId={selectedChainId}
        setSelectedChainId={setSelectedChainId}
        refetchInitialTokens={() => refetchInitialTokens()}
      />
    </>
  );
};
