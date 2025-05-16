import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from 'src/components/transactions/Switch/common';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

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
  return transformedTokens.filter((token) => token.chainId === realChainId);
};

const BaseSwitchModalContentWrapper = ({
  user,
  chainId,
  modalType,
  switchDetails: swapDetails,
  inputBalanceTitle: balanceTitle,
  tokensFrom,
  tokensTo,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
}: {
  user: string;
  chainId: number;
  setSelectedChainId: (chainId: number) => void;
} & SwitchModalCustomizableProps) => {
  const filteredTokens = useMemo(() => getFilteredTokensForSwitch(chainId), [chainId]);

  const { data: baseTokenList } = useTokensBalance(filteredTokens, chainId, user);

  const { defaultInputToken, defaultOutputToken } = useMemo(() => {
    let auxInputToken = forcedDefaultInputToken;
    let auxOutputToken = forcedDefaultOutputToken;

    const fromList = tokensFrom || baseTokenList || filteredTokens;
    const toList = tokensTo || baseTokenList || filteredTokens;

    if (!auxInputToken) {
      auxInputToken =
        fromList.find((token) => token.extensions?.isNative) || fromList.length > 0
          ? fromList[0]
          : undefined;
    }

    if (!auxOutputToken) {
      auxOutputToken =
        toList.find(
          (token) =>
            (token.address === AaveV3Ethereum.ASSETS.GHO.UNDERLYING || token.symbol == 'AAVE') &&
            token.address !== auxInputToken?.address
        ) || toList.find((token) => token.address !== auxInputToken?.address);
    }

    invariant(auxInputToken && auxOutputToken, 'token list should have at least 2 assets');

    return {
      defaultInputToken: auxInputToken ?? fromList[0],
      defaultOutputToken: auxOutputToken ?? toList[1],
    };
  }, [baseTokenList, filteredTokens, tokensFrom, tokensTo]);

  if (!baseTokenList) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BaseSwitchModalContent
      tokensFrom={tokensFrom?.length ? tokensFrom : baseTokenList}
      tokensTo={tokensTo?.length ? tokensTo : baseTokenList}
      supportedNetworks={supportedNetworksWithEnabledMarket}
      defaultInputToken={defaultInputToken}
      defaultOutputToken={defaultOutputToken}
      selectedChainId={chainId}
      modalType={modalType}
      switchDetails={swapDetails}
      inputBalanceTitle={balanceTitle}
    />
  );
};

export const BaseSwitchModal = ({
  modalType,
  switchDetails: swapDetails,
  inputBalanceTitle: balanceTitle,
  tokensFrom,
  tokensTo,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
}: SwitchModalCustomizableProps) => {
  const {
    type,
    close,
    args: { chainId },
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId } = useWeb3Context();
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

  useEffect(() => {
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
    } else if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId)) {
      setSelectedChainId(currentChainId);
    } else {
      setSelectedChainId(defaultNetwork.chainId);
    }
  }, [currentChainId, chainId, connectedChainId]);

  return (
    <BasicModal open={type === modalType} setOpen={close}>
      {!user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to switch your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <BaseSwitchModalContentWrapper
          user={user}
          chainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          modalType={modalType}
          switchDetails={swapDetails}
          inputBalanceTitle={balanceTitle}
          tokensFrom={tokensFrom}
          tokensTo={tokensTo}
          forcedDefaultInputToken={forcedDefaultInputToken}
          forcedDefaultOutputToken={forcedDefaultOutputToken}
        />
      )}
    </BasicModal>
  );
};
