import { ChainId, ReserveDataHumanized } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { providers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import {
  CustomMarket,
  getNetworkConfig,
  getProvider,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { supportedNetworksWithEnabledMarket } from './common';
import { SwitchModalContent } from './SwitchModalContent';

export interface ReserveWithBalance extends ReserveDataHumanized {
  balance: string;
  iconSymbol: string;
}

export interface TokenInterface {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: string;
}

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModal = () => {
  const {
    type,
    close,
    args: { chainId },
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

  const [tokenListWithBalance, setTokensListBalance] = useState<TokenInterface[]>([]);

  const selectedNetworkConfig = getNetworkConfig(selectedChainId);

  useEffect(() => {
    // Passing chainId as prop will set default network for switch modal
    if (chainId && supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === chainId)) {
      setSelectedChainId(chainId);
    } else if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId)) {
      setSelectedChainId(currentChainId);
    } else {
      setSelectedChainId(defaultNetwork.chainId);
    }
  }, [currentChainId, chainId]);

  const filteredTokens = useMemo(() => {
    const transformedTokens = TOKEN_LIST.tokens.map((token) => {
      return { ...token, balance: '0' };
    });

    let tokens = transformedTokens.filter(
      (token) => token.chainId === selectedNetworkConfig.underlyingChainId ?? selectedChainId
    );

    if (tokens.length === 0) {
      tokens = transformedTokens.filter((token) => token.chainId === 1);
      setSelectedChainId(ChainId.mainnet); // Defaults to Ethereum if no tokens are found on some networks
    }

    return tokens;
  }, [selectedChainId]);

  const contractCallContext: ContractCallContext[] = filteredTokens.map((token) => {
    return {
      reference: token.address,
      contractAddress: token.address,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: 'balance', type: 'uint256' }],
        },
      ],
      calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [user] }],
    };
  });
  const provider = getProvider(selectedChainId);

  useEffect(() => {
    const fetchData = async () => {
      setTokensListBalance([]);

      const multicall = new Multicall({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ethersProvider: provider as unknown as providers.Provider,
        tryAggregate: true,
        multicallCustomContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      });
      if (
        !type ||
        type !== ModalType.Switch ||
        !user ||
        user.length !== 42 ||
        !user.startsWith('0x')
      ) {
        return;
      }

      try {
        const ethBalance = await provider.getBalance(user);
        const { results }: ContractCallResults = await multicall.call(contractCallContext);

        const updatedTokens = filteredTokens.map((token) => {
          let balance = '0';

          // NOTE just for deploy
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (token.extensions && token.extensions.isNative) {
            // Network Asset (ETH, MATIC, etc)
            balance = formatUnits(ethBalance, token.decimals);
          } else {
            Object.values(results).forEach((contract) => {
              if (
                contract.originalContractCallContext.contractAddress.toLowerCase() ===
                token.address.toLowerCase()
              ) {
                const balanceData = contract.callsReturnContext[0].returnValues[0];

                if (balanceData) {
                  balance = formatUnits(balanceData, token.decimals);
                }
              }
            });
          }
          return {
            ...token,
            balance,
          };
        });

        setTokensListBalance(updatedTokens);
      } catch (error) {
        console.error('Multicall error:', error);
        // should we just silently let answers fail?
      }
    };

    fetchData();
  }, [user, provider, selectedChainId, type]);

  const tokenListSortedByBalace = tokenListWithBalance.sort(
    (a, b) => Number(b.balance) - Number(a.balance)
  );

  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      {tokenListSortedByBalace.length > 1 ? (
        <SwitchModalContent
          key={selectedChainId}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          reserves={tokenListSortedByBalace}
          selectedNetworkConfig={selectedNetworkConfig}
          // defaultAsset={underlyingAsset}
        />
      ) : !user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to switch your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
          <CircularProgress />
        </Box>
      )}
    </BasicModal>
  );
};
