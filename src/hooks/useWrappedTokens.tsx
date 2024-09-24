import { normalize } from '@aave/math-utils';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
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

const wrappedTokenConfig: {
  [market: string]: Array<{
    tokenIn: string;
    tokenOut: string;
    tokenWrapperContractAddress: string;
  }>;
} = {
  [CustomMarket.proto_mainnet_v3]: [
    {
      tokenIn: AaveV3Ethereum.ASSETS.DAI.UNDERLYING.toLowerCase(),
      tokenOut: AaveV3Ethereum.ASSETS.sDAI.UNDERLYING.toLowerCase(),
      tokenWrapperContractAddress: AaveV3Ethereum.SAVINGS_DAI_TOKEN_WRAPPER,
    },
    {
      tokenIn: '0xdC035D45d973E3EC169d2276DDab16f1e407384F'.toLowerCase(),
      tokenOut: '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD'.toLowerCase(),
      tokenWrapperContractAddress: '0xEE220dEFCaE7344C62cc93E309bB88d723CFf122',
    },
  ],
};

export const useWrappedTokens = () => {
  const { marketReferencePriceInUsd, marketReferenceCurrencyDecimals, reserves } =
    useAppDataContext();
  const currentMarket = useRootStore((store) => store.currentMarket);

  const { data: wrappedTokenData } = useWrappedTokenDataProvider();

  if (!reserves || reserves.length === 0 || !wrappedTokenData) {
    return [];
  }

  const wrappedTokens = wrappedTokenConfig[currentMarket] ?? [];
  let wrappedTokenReserves: WrappedTokenConfig[] = [];

  wrappedTokenReserves = wrappedTokens.map<WrappedTokenConfig>((config) => {
    const tokenInReserve = reserves.find((reserve) => reserve.underlyingAsset === config.tokenIn);
    const tokenOutReserve = reserves.find((reserve) => reserve.underlyingAsset === config.tokenOut);

    if (!tokenOutReserve) {
      // we always need a tokenOutReserve, tokenInReserve is not required
      throw new Error('wrapped token out reserve not found');
    }

    const { tokenIn, tokenOut } = wrappedTokenData;

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
      tokenWrapperAddress: config.tokenWrapperContractAddress,
    };
  });

  return wrappedTokenReserves;
};

type TokenDetails = {
  token: string;
  decimals: number;
  name: string;
  symbol: string;
  balance: BigNumber;
  latestAnswer: BigNumber;
};

const useWrappedTokenDataProvider = () => {
  const dataProviderAddress = '0x312d98Bd3ecBC0abf4abbA32c738d9EA22f173CE';
  const [chainId, account] = useRootStore((store) => [store.currentChainId, store.account]);
  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      const abi = [
        {
          inputs: [
            {
              internalType: 'address',
              name: 'user',
              type: 'address',
            },
          ],
          name: 'getWrappedTokenData',
          outputs: [
            {
              components: [
                {
                  components: [
                    {
                      internalType: 'address',
                      name: 'token',
                      type: 'address',
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
                  ],
                  internalType: 'struct WrappedTokenDataProvider.TokenDetails',
                  name: 'tokenIn',
                  type: 'tuple',
                },
                {
                  components: [
                    {
                      internalType: 'address',
                      name: 'token',
                      type: 'address',
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
                  ],
                  internalType: 'struct WrappedTokenDataProvider.TokenDetails',
                  name: 'tokenOut',
                  type: 'tuple',
                },
                {
                  internalType: 'address',
                  name: 'tokenWrapperContract',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'exchangeRate',
                  type: 'uint256',
                },
              ],
              internalType: 'struct WrappedTokenDataProvider.WrappedToken[]',
              name: '',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ];
      const contract = new Contract(dataProviderAddress, abi, provider);
      const result: [
        unknown,
        unknown,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] = (await contract.getWrappedTokenData(account))[0];

      const tokenInDetails = result[0] as TokenDetails;
      const tokenOutDetails = result[1] as TokenDetails;
      const [, , tokenWrapper, exchangeRate] = result;

      return {
        tokenIn: {
          address: tokenInDetails.token,
          name: tokenInDetails.name,
          symbol: tokenInDetails.symbol,
          balance: tokenInDetails.balance.toString(),
          decimals: tokenInDetails.decimals,
          price: tokenInDetails.latestAnswer.toNumber(),
        },
        tokenOut: {
          address: tokenOutDetails.token,
          name: tokenOutDetails.name,
          symbol: tokenOutDetails.symbol,
          balance: tokenOutDetails.balance.toString(),
          decimals: tokenOutDetails.decimals,
          price: tokenOutDetails.latestAnswer.toNumber(),
        },
        tokenWrapper,
        exchangeRate: exchangeRate.toString(),
      };
    },
    queryKey: ['getWrappedTokenData', chainId],
    enabled: !!account,
  });
};
