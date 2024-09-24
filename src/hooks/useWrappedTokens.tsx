import { normalize } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { amountToUsd } from 'src/utils/utils';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';

export type WrappedToken = {
  symbol: string;
  underlyingAsset: string;
  decimals: number;
  priceInUSD: string;
  formattedPriceInMarketReferenceCurrency: string;
  balance: string;
};

export type WrappedTokenConfig = {
  tokenIn: WrappedToken;
  tokenOut: WrappedToken;
  tokenWrapperAddress: string;
};

// const wrappedTokenConfig: {
//   [market: string]: Array<{
//     tokenIn: string;
//     tokenOut: string;
//     tokenWrapperContractAddress: string;
//   }>;
// } = {
//   [CustomMarket.proto_mainnet_v3]: [
//     {
//       tokenIn: AaveV3Ethereum.ASSETS.DAI.UNDERLYING.toLowerCase(),
//       tokenOut: AaveV3Ethereum.ASSETS.sDAI.UNDERLYING.toLowerCase(),
//       tokenWrapperContractAddress: AaveV3Ethereum.SAVINGS_DAI_TOKEN_WRAPPER,
//     },
//     {
//       tokenIn: '0xdC035D45d973E3EC169d2276DDab16f1e407384F'.toLowerCase(),
//       tokenOut: '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD'.toLowerCase(),
//       tokenWrapperContractAddress: '0xEE220dEFCaE7344C62cc93E309bB88d723CFf122',
//     },
//   ],
// };

export const useWrappedTokens = () => {
  const { marketReferencePriceInUsd, marketReferenceCurrencyDecimals, reserves } =
    useAppDataContext();
  // const currentMarket = useRootStore((store) => store.currentMarket);

  const { data: wrappedTokenData } = useWrappedTokenDataProvider();

  if (!reserves || reserves.length === 0 || !wrappedTokenData) {
    return [];
  }

  console.log('wrappedTokenData', wrappedTokenData);
  // const wrappedTokens = wrappedTokenConfig[currentMarket] ?? [];
  let wrappedTokenReserves: WrappedTokenConfig[] = [];

  wrappedTokenReserves = wrappedTokenData.map<WrappedTokenConfig>((config) => {
    const tokenInReserve = reserves.find(
      (reserve) => reserve.underlyingAsset === config.tokenIn.address.toLowerCase()
    );
    const tokenOutReserve = reserves.find(
      (reserve) => reserve.underlyingAsset === config.tokenOut.address.toLowerCase()
    );

    if (!tokenOutReserve) {
      // we always need a tokenOutReserve, tokenInReserve is not required
      throw new Error('wrapped token out reserve not found');
    }

    const { tokenIn, tokenOut } = config;

    let tokenInFormattedPriceInMarketReferenceCurrency = '0';
    if (tokenInReserve) {
      tokenInFormattedPriceInMarketReferenceCurrency = normalize(
        tokenInReserve.priceInMarketReferenceCurrency,
        marketReferenceCurrencyDecimals
      );
    } else {
      tokenInFormattedPriceInMarketReferenceCurrency = normalize(tokenIn.price, 8);
    }

    const tokenOutFormattedPriceInMarketReferenceCurrency = normalize(
      tokenOutReserve.priceInMarketReferenceCurrency,
      marketReferenceCurrencyDecimals
    );

    return {
      tokenIn: {
        symbol: tokenInReserve?.symbol ?? tokenIn.symbol,
        underlyingAsset: tokenInReserve?.underlyingAsset ?? tokenIn.address,
        decimals: tokenInReserve?.decimals ?? tokenIn.decimals,
        priceInUSD: amountToUsd(
          1,
          tokenInFormattedPriceInMarketReferenceCurrency,
          marketReferencePriceInUsd
        ).toString(),
        formattedPriceInMarketReferenceCurrency: tokenInFormattedPriceInMarketReferenceCurrency,
        balance: formatUnits(tokenIn.balance, tokenIn.decimals),
      },
      tokenOut: {
        symbol: tokenOutReserve.symbol,
        underlyingAsset: tokenOutReserve.underlyingAsset,
        decimals: tokenOutReserve.decimals,
        priceInUSD: amountToUsd(
          1,
          tokenOutFormattedPriceInMarketReferenceCurrency,
          marketReferencePriceInUsd
        ).toString(),
        formattedPriceInMarketReferenceCurrency: tokenOutFormattedPriceInMarketReferenceCurrency,
        balance: formatUnits(tokenOut.balance, tokenOut.decimals),
      },
      tokenWrapperAddress: config.tokenWrapper,
    };
  });

  return wrappedTokenReserves;
};

type TokenDetailsResponse = {
  token: string;
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: number;
  latestAnswer: BigNumber;
};

type WrappedTokenDataResponse = {
  tokenIn: TokenDetailsResponse;
  tokenOut: TokenDetailsResponse;
  tokenWrapperContract: string;
};

const useWrappedTokenDataProvider = () => {
  const dataProviderAddress = '0xBd3E680F670B7780457ba4D1D5C5e1Be9943BB30';
  const [chainId, account, marketData] = useRootStore((store) => [
    store.currentChainId,
    store.account,
    store.currentMarketData,
  ]);
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      const abi = [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'poolAddress',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'user',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'getWrappedTokenData',
          outputs: [
            {
              internalType: 'struct WrappedTokenDataProvider.WrappedToken[]',
              name: '',
              type: 'tuple[]',
              components: [
                {
                  internalType: 'struct WrappedTokenDataProvider.TokenDetails',
                  name: 'tokenIn',
                  type: 'tuple',
                  components: [
                    {
                      internalType: 'address',
                      name: 'token',
                      type: 'address',
                    },
                    {
                      internalType: 'uint256',
                      name: 'balance',
                      type: 'uint256',
                    },
                    {
                      internalType: 'int256',
                      name: 'latestAnswer',
                      type: 'int256',
                    },
                    {
                      internalType: 'uint8',
                      name: 'decimals',
                      type: 'uint8',
                    },
                    {
                      internalType: 'string',
                      name: 'name',
                      type: 'string',
                    },
                    {
                      internalType: 'string',
                      name: 'symbol',
                      type: 'string',
                    },
                  ],
                },
                {
                  internalType: 'struct WrappedTokenDataProvider.TokenDetails',
                  name: 'tokenOut',
                  type: 'tuple',
                  components: [
                    {
                      internalType: 'address',
                      name: 'token',
                      type: 'address',
                    },
                    {
                      internalType: 'uint256',
                      name: 'balance',
                      type: 'uint256',
                    },
                    {
                      internalType: 'int256',
                      name: 'latestAnswer',
                      type: 'int256',
                    },
                    {
                      internalType: 'uint8',
                      name: 'decimals',
                      type: 'uint8',
                    },
                    {
                      internalType: 'string',
                      name: 'name',
                      type: 'string',
                    },
                    {
                      internalType: 'string',
                      name: 'symbol',
                      type: 'string',
                    },
                  ],
                },
                {
                  internalType: 'address',
                  name: 'tokenWrapperContract',
                  type: 'address',
                },
              ],
            },
          ],
        },
      ];
      const contract = new Contract(dataProviderAddress, abi, provider);
      const result: WrappedTokenDataResponse[] = await contract.getWrappedTokenData(
        marketData.addresses.LENDING_POOL,
        account
      );

      return result.map((r) => ({
        tokenIn: {
          address: r.tokenIn.token,
          name: r.tokenIn.name,
          symbol: r.tokenIn.symbol,
          balance: r.tokenIn.balance.toString(),
          decimals: r.tokenIn.decimals,
          price: r.tokenIn.latestAnswer.toNumber(),
        },
        tokenOut: {
          address: r.tokenOut.token,
          name: r.tokenOut.name,
          symbol: r.tokenOut.symbol,
          balance: r.tokenOut.balance.toString(),
          decimals: r.tokenOut.decimals,
          price: r.tokenOut.latestAnswer.toNumber(),
        },
        tokenWrapper: r.tokenWrapperContract,
      }));
    },
    queryKey: ['getWrappedTokenData', marketData.addresses.LENDING_POOL],
    enabled: !!account,
  });
};
