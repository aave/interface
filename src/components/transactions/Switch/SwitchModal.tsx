import { ReserveDataHumanized } from '@aave/contract-helpers';
// import { normalize } from '@aave/math-utils';
import { Box, CircularProgress } from '@mui/material';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { providers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
// import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
// import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { ModalType, useModalContext } from 'src/hooks/useModal';
// import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import TOKEN_LIST from 'src/ui-config/TokenList.json';
// import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
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
  // extensions?: {
  //   bridgeInfo: BridgeInfo;
  // };
}

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export const SwitchModal = () => {
  const {
    type,
    close,
    args: { underlyingAsset, chainId },
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

  // fetch and filter by chainId
  const filteredTokens = TOKEN_LIST.tokens.filter((token) => token.chainId === selectedChainId);

  const contractCallContext: ContractCallContext[] = filteredTokens.map((token) => {
    return {
      reference: token.address,
      contractAddress: token.address,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view', // Adding the stateMutability field
          inputs: [{ name: 'account', type: 'address' }], // Corrected input type to 'address'
          outputs: [{ name: 'balance', type: 'uint256' }],
        },
      ],
      calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [user] }],
    };
  });
  const provider = getProvider(currentChainId);

  useEffect(() => {
    const fetchData = async () => {
      const multicall = new Multicall({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ethersProvider: provider as unknown as providers.Provider,
        tryAggregate: true,
      });
      if (!user || user.length !== 42 || !user.startsWith('0x')) {
        console.error('Invalid user address:', user);
        return;
      }
      console.log('filteredTokens', filteredTokens);
      try {
        const { results }: ContractCallResults = await multicall.call(contractCallContext);
        const updatedTokens = filteredTokens.map((token) => {
          let balance = '0';
          Object.values(results).forEach((contract) => {
            if (
              contract.originalContractCallContext.contractAddress.toLowerCase() ===
              token.address.toLowerCase()
            ) {
              const balanceData = contract.callsReturnContext[0].returnValues[0];

              balance = formatUnits(balanceData, token.decimals);
            }
          });

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
  }, [user, provider, selectedChainId]);

  const marketsBySupportedNetwork = useMemo(
    () =>
      Object.values(marketsData).filter(
        (elem) => elem.chainId === selectedChainId && elem.enabledFeatures?.switch
      ),
    [selectedChainId]
  );

  console.log('marketsBySupportedNetwork', marketsBySupportedNetwork);

  // const poolReservesDataQueries = usePoolsReservesHumanized(marketsBySupportedNetwork, {
  //   refetchInterval: 0,
  // });

  // const networkReserves = poolReservesDataQueries.reduce((acum, elem) => {
  //   if (elem.data) {
  //     const wrappedBaseAsset = elem.data.reservesData.find(
  //       (reserveData) => reserveData.symbol === selectedNetworkConfig.wrappedBaseAssetSymbol
  //     );
  //     const acumWithoutBaseAsset = acum.concat(
  //       elem.data.reservesData.filter(
  //         (reserveDataElem) =>
  //           !acum.find((acumElem) => acumElem.underlyingAsset === reserveDataElem.underlyingAsset)
  //       )
  //     );
  //     if (
  //       wrappedBaseAsset &&
  //       !acum.find((acumElem) => acumElem.underlyingAsset === API_ETH_MOCK_ADDRESS)
  //     )
  //       return acumWithoutBaseAsset.concat({
  //         ...wrappedBaseAsset,
  //         underlyingAsset: API_ETH_MOCK_ADDRESS,
  //         decimals: selectedNetworkConfig.baseAssetDecimals,
  //         ...fetchIconSymbolAndName({
  //           underlyingAsset: API_ETH_MOCK_ADDRESS,
  //           symbol: selectedNetworkConfig.baseAssetSymbol,
  //         }),
  //       });
  //     return acumWithoutBaseAsset;
  //   }
  //   return acum;
  // }, [] as ReserveDataHumanized[]);

  // const poolBalancesDataQueries = usePoolsTokensBalance(marketsBySupportedNetwork, user, {
  //   refetchInterval: 0,
  // });

  // const poolsBalances = poolBalancesDataQueries.reduce((acum, elem) => {
  //   if (elem.data) return acum.concat(elem.data);
  //   return acum;
  // }, [] as UserPoolTokensBalances[]);

  // const reservesWithBalance: ReserveWithBalance[] = useMemo(() => {
  //   return networkReserves.map((elem) => {
  //     return {
  //       ...elem,
  //       ...fetchIconSymbolAndName({
  //         underlyingAsset: elem.underlyingAsset,
  //         symbol: elem.symbol,
  //         name: elem.name,
  //       }),
  //       balance: normalize(
  //         poolsBalances
  //           .find(
  //             (balance) =>
  //               balance.address.toLocaleLowerCase() === elem.underlyingAsset.toLocaleLowerCase()
  //           )
  //           ?.amount.toString() || '0',
  //         elem.decimals
  //       ),
  //     };
  //   });
  // }, [networkReserves, poolsBalances]);

  // const reserversWithBalanceSortedByBalance = reservesWithBalance.sort(
  //   (a, b) => Number(b.balance) - Number(a.balance)
  // );

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
          defaultAsset={underlyingAsset}
        />
      ) : (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
          <CircularProgress />
        </Box>
      )}
    </BasicModal>
  );
};
