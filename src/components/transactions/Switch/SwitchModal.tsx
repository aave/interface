import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { BasicModal } from '../../primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from './common';
import { SwitchModalContent } from './SwitchModalContent';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

interface SwitchModalContentWrapperProps {
  user: string;
  chainId: number;
  setSelectedChainId: (chainId: number) => void;
}

const getFilteredTokens = (chainId: number): TokenInfoWithBalance[] => {
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

const SwitchModalContentWrapper = ({
  user,
  chainId,
  setSelectedChainId,
}: SwitchModalContentWrapperProps) => {
  const filteredTokens = useMemo(() => getFilteredTokens(chainId), [chainId]);

  const { data: baseTokenList } = useTokensBalance(filteredTokens, chainId, user);

  const { defaultInputToken, defaultOutputToken } = useMemo(() => {
    if (baseTokenList) {
      const defaultInputToken =
        baseTokenList.find((token) => token.extensions?.isNative) || baseTokenList[0];
      const defaultOutputToken =
        baseTokenList.find(
          (token) =>
            (token.address === AaveV3Ethereum.ASSETS.GHO.UNDERLYING || token.symbol == 'AAVE') &&
            token.address !== defaultInputToken.address
        ) || baseTokenList.find((token) => token.address !== defaultInputToken.address);
      invariant(
        defaultInputToken && defaultOutputToken,
        'token list should have at least 2 assets'
      );
      return { defaultInputToken, defaultOutputToken };
    }
    return { defaultInputToken: filteredTokens[0], defaultOutputToken: filteredTokens[1] };
  }, [baseTokenList, filteredTokens]);

  const queryClient = useQueryClient();

  const addNewToken = async (token: TokenInfoWithBalance) => {
    queryClient.setQueryData<TokenInfoWithBalance[]>(
      queryKeysFactory.tokensBalance(filteredTokens, chainId, user),
      (oldData) => {
        if (oldData)
          return [...oldData, token].sort((a, b) => Number(b.balance) - Number(a.balance));
        return [token];
      }
    );
    const customTokens = localStorage.getItem('customTokens');
    const newTokenInfo = {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
      name: token.name,
      logoURI: token.logoURI,
      extensions: {
        isUserCustom: true,
      },
    };
    if (customTokens) {
      const parsedCustomTokens: TokenInfo[] = JSON.parse(customTokens);
      parsedCustomTokens.push(newTokenInfo);
      localStorage.setItem('customTokens', JSON.stringify(parsedCustomTokens));
    } else {
      localStorage.setItem('customTokens', JSON.stringify([newTokenInfo]));
    }
  };

  if (!baseTokenList) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SwitchModalContent
      key={chainId}
      selectedChainId={chainId}
      setSelectedChainId={setSelectedChainId}
      supportedNetworks={supportedNetworksWithEnabledMarket}
      defaultInputToken={defaultInputToken}
      defaultOutputToken={defaultOutputToken}
      tokens={baseTokenList}
      addNewToken={addNewToken}
    />
  );
};

export const SwitchModal = () => {
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
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      {!user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to switch your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <SwitchModalContentWrapper
          user={user}
          chainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
        />
      )}
    </BasicModal>
  );
};
