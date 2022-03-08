/* eslint-disable */
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type BaseCurrencyData = {
  __typename?: 'BaseCurrencyData';
  marketReferenceCurrencyDecimals: Scalars['Float'];
  marketReferenceCurrencyPriceInUsd: Scalars['String'];
  networkBaseTokenPriceDecimals: Scalars['Float'];
  networkBaseTokenPriceInUsd: Scalars['String'];
};

export type IncentiveData = {
  __typename?: 'IncentiveData';
  incentiveControllerAddress: Scalars['String'];
  rewardsTokenInformation: Array<RewardInfo>;
  tokenAddress: Scalars['String'];
};

export type ProtocolData = {
  __typename?: 'ProtocolData';
  baseCurrencyData: BaseCurrencyData;
  reserves: Array<ReserveData>;
};

export type Query = {
  __typename?: 'Query';
  ping: Scalars['String'];
  protocolData: ProtocolData;
  reservesIncentives: Array<ReserveIncentivesData>;
  stakeGeneralUIData: StakeGeneralUiData;
  stakeUserUIData: StakeUserUiData;
  userData: UserReservesData;
  userIncentives: Array<UserIncentivesData>;
};

export type QueryProtocolDataArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
};

export type QueryReservesIncentivesArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
};

export type QueryStakeUserUiDataArgs = {
  chainId: Scalars['Int'];
  userAddress: Scalars['String'];
};

export type QueryUserDataArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type QueryUserIncentivesArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type ReserveData = {
  __typename?: 'ReserveData';
  aTokenAddress: Scalars['String'];
  accruedToTreasury: Scalars['String'];
  availableLiquidity: Scalars['String'];
  averageStableRate: Scalars['String'];
  baseLTVasCollateral: Scalars['String'];
  baseStableBorrowRate: Scalars['String'];
  baseVariableBorrowRate: Scalars['String'];
  borrowCap: Scalars['String'];
  borrowableInIsolation: Scalars['Boolean'];
  borrowingEnabled: Scalars['Boolean'];
  debtCeiling: Scalars['String'];
  debtCeilingDecimals: Scalars['Float'];
  decimals: Scalars['Float'];
  eModeCategoryId: Scalars['Float'];
  eModeLabel: Scalars['String'];
  eModeLiquidationBonus: Scalars['Float'];
  eModeLiquidationThreshold: Scalars['Float'];
  eModeLtv: Scalars['Float'];
  eModePriceSource: Scalars['String'];
  id: Scalars['String'];
  interestRateStrategyAddress: Scalars['String'];
  isActive: Scalars['Boolean'];
  isFrozen: Scalars['Boolean'];
  isPaused: Scalars['Boolean'];
  isolationModeTotalDebt: Scalars['String'];
  lastUpdateTimestamp: Scalars['Float'];
  liquidityIndex: Scalars['String'];
  liquidityRate: Scalars['String'];
  name: Scalars['String'];
  optimalUsageRatio: Scalars['String'];
  priceInMarketReferenceCurrency: Scalars['String'];
  priceOracle: Scalars['String'];
  reserveFactor: Scalars['String'];
  reserveLiquidationBonus: Scalars['String'];
  reserveLiquidationThreshold: Scalars['String'];
  stableBorrowRate: Scalars['String'];
  stableBorrowRateEnabled: Scalars['Boolean'];
  stableDebtLastUpdateTimestamp: Scalars['Float'];
  stableDebtTokenAddress: Scalars['String'];
  stableRateSlope1: Scalars['String'];
  stableRateSlope2: Scalars['String'];
  supplyCap: Scalars['String'];
  symbol: Scalars['String'];
  totalPrincipalStableDebt: Scalars['String'];
  totalScaledVariableDebt: Scalars['String'];
  unbacked: Scalars['String'];
  underlyingAsset: Scalars['String'];
  usageAsCollateralEnabled: Scalars['Boolean'];
  variableBorrowIndex: Scalars['String'];
  variableBorrowRate: Scalars['String'];
  variableDebtTokenAddress: Scalars['String'];
  variableRateSlope1: Scalars['String'];
  variableRateSlope2: Scalars['String'];
};

export type ReserveIncentivesData = {
  __typename?: 'ReserveIncentivesData';
  aIncentiveData: IncentiveData;
  id: Scalars['String'];
  sIncentiveData: IncentiveData;
  underlyingAsset: Scalars['String'];
  vIncentiveData: IncentiveData;
};

export type RewardInfo = {
  __typename?: 'RewardInfo';
  emissionEndTimestamp: Scalars['Float'];
  emissionPerSecond: Scalars['String'];
  incentivesLastUpdateTimestamp: Scalars['Float'];
  precision: Scalars['Float'];
  priceFeedDecimals: Scalars['Float'];
  rewardOracleAddress: Scalars['String'];
  rewardPriceFeed: Scalars['String'];
  rewardTokenAddress: Scalars['String'];
  rewardTokenDecimals: Scalars['Float'];
  rewardTokenSymbol: Scalars['String'];
  tokenIncentivesIndex: Scalars['String'];
};

export type StakeGeneralData = {
  __typename?: 'StakeGeneralData';
  distributionEnd: Scalars['String'];
  distributionPerSecond: Scalars['String'];
  rewardTokenPriceEth: Scalars['String'];
  stakeApy: Scalars['String'];
  stakeCooldownSeconds: Scalars['Float'];
  stakeTokenPriceEth: Scalars['String'];
  stakeTokenTotalSupply: Scalars['String'];
  stakeUnstakeWindow: Scalars['Float'];
};

export type StakeGeneralUiData = {
  __typename?: 'StakeGeneralUIData';
  aave: StakeGeneralData;
  bpt: StakeGeneralData;
  usdPriceEth: Scalars['String'];
};

export type StakeUserData = {
  __typename?: 'StakeUserData';
  stakeTokenUserBalance: Scalars['String'];
  underlyingTokenUserBalance: Scalars['String'];
  userCooldown: Scalars['Float'];
  userIncentivesToClaim: Scalars['String'];
  userPermitNonce: Scalars['String'];
};

export type StakeUserUiData = {
  __typename?: 'StakeUserUIData';
  aave: StakeUserData;
  bpt: StakeUserData;
  usdPriceEth: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  poolIncentivesDataUpdate: Array<ReserveIncentivesData>;
  protocolDataUpdate: ProtocolData;
  stakeGeneralUIDataUpdate: StakeGeneralUiData;
  stakeUserUIDataUpdate: StakeUserUiData;
  userDataUpdate: UserReservesData;
  userPoolIncentivesDataUpdate: Array<UserIncentivesData>;
};

export type SubscriptionPoolIncentivesDataUpdateArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
};

export type SubscriptionProtocolDataUpdateArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
};

export type SubscriptionStakeUserUiDataUpdateArgs = {
  chainId: Scalars['Int'];
  userAddress: Scalars['String'];
};

export type SubscriptionUserDataUpdateArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type SubscriptionUserPoolIncentivesDataUpdateArgs = {
  chainId: Scalars['Int'];
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type UserIncentiveData = {
  __typename?: 'UserIncentiveData';
  incentiveControllerAddress: Scalars['String'];
  tokenAddress: Scalars['String'];
  userRewardsInformation: Array<UserRewardInfo>;
};

export type UserIncentivesData = {
  __typename?: 'UserIncentivesData';
  aTokenIncentivesUserData: UserIncentiveData;
  id: Scalars['String'];
  sTokenIncentivesUserData: UserIncentiveData;
  underlyingAsset: Scalars['String'];
  vTokenIncentivesUserData: UserIncentiveData;
};

export type UserReserveData = {
  __typename?: 'UserReserveData';
  id: Scalars['String'];
  principalStableDebt: Scalars['String'];
  scaledATokenBalance: Scalars['String'];
  scaledVariableDebt: Scalars['String'];
  stableBorrowLastUpdateTimestamp: Scalars['Float'];
  stableBorrowRate: Scalars['String'];
  underlyingAsset: Scalars['String'];
  usageAsCollateralEnabledOnUser: Scalars['Boolean'];
};

export type UserReservesData = {
  __typename?: 'UserReservesData';
  userEmodeCategoryId: Scalars['Float'];
  userReserves: Array<UserReserveData>;
};

export type UserRewardInfo = {
  __typename?: 'UserRewardInfo';
  priceFeedDecimals: Scalars['Float'];
  rewardOracleAddress: Scalars['String'];
  rewardPriceFeed: Scalars['String'];
  rewardTokenAddress: Scalars['String'];
  rewardTokenDecimals: Scalars['Float'];
  rewardTokenSymbol: Scalars['String'];
  tokenIncentivesUserIndex: Scalars['String'];
  userUnclaimedRewards: Scalars['String'];
};

export type StakeGeneralUiDataFragmentFragment = {
  __typename?: 'StakeGeneralUIData';
  usdPriceEth: string;
  aave: {
    __typename?: 'StakeGeneralData';
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
  bpt: {
    __typename?: 'StakeGeneralData';
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
};

export type C_StakeGeneralUiDataQueryVariables = Exact<{ [key: string]: never }>;

export type C_StakeGeneralUiDataQuery = {
  __typename?: 'Query';
  stakeGeneralUIData: {
    __typename?: 'StakeGeneralUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeGeneralData';
      stakeTokenTotalSupply: string;
      stakeCooldownSeconds: number;
      stakeUnstakeWindow: number;
      stakeTokenPriceEth: string;
      rewardTokenPriceEth: string;
      stakeApy: string;
      distributionPerSecond: string;
      distributionEnd: string;
    };
    bpt: {
      __typename?: 'StakeGeneralData';
      stakeTokenTotalSupply: string;
      stakeCooldownSeconds: number;
      stakeUnstakeWindow: number;
      stakeTokenPriceEth: string;
      rewardTokenPriceEth: string;
      stakeApy: string;
      distributionPerSecond: string;
      distributionEnd: string;
    };
  };
};

export type C_StakeGeneralUiDataUpdateSubscriptionVariables = Exact<{ [key: string]: never }>;

export type C_StakeGeneralUiDataUpdateSubscription = {
  __typename?: 'Subscription';
  stakeGeneralUIDataUpdate: {
    __typename?: 'StakeGeneralUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeGeneralData';
      stakeTokenTotalSupply: string;
      stakeCooldownSeconds: number;
      stakeUnstakeWindow: number;
      stakeTokenPriceEth: string;
      rewardTokenPriceEth: string;
      stakeApy: string;
      distributionPerSecond: string;
      distributionEnd: string;
    };
    bpt: {
      __typename?: 'StakeGeneralData';
      stakeTokenTotalSupply: string;
      stakeCooldownSeconds: number;
      stakeUnstakeWindow: number;
      stakeTokenPriceEth: string;
      rewardTokenPriceEth: string;
      stakeApy: string;
      distributionPerSecond: string;
      distributionEnd: string;
    };
  };
};

export type StakeUserUiDataFragmentFragment = {
  __typename?: 'StakeUserUIData';
  usdPriceEth: string;
  aave: {
    __typename?: 'StakeUserData';
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
  bpt: {
    __typename?: 'StakeUserData';
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
};

export type C_StakeUserUiDataQueryVariables = Exact<{
  userAddress: Scalars['String'];
  chainId: Scalars['Int'];
}>;

export type C_StakeUserUiDataQuery = {
  __typename?: 'Query';
  stakeUserUIData: {
    __typename?: 'StakeUserUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
    bpt: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
  };
};

export type C_StakeUserUiDataUpdateSubscriptionVariables = Exact<{
  userAddress: Scalars['String'];
  chainId: Scalars['Int'];
}>;

export type C_StakeUserUiDataUpdateSubscription = {
  __typename?: 'Subscription';
  stakeUserUIDataUpdate: {
    __typename?: 'StakeUserUIData';
    usdPriceEth: string;
    aave: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
    bpt: {
      __typename?: 'StakeUserData';
      stakeTokenUserBalance: string;
      underlyingTokenUserBalance: string;
      userCooldown: number;
      userIncentivesToClaim: string;
      userPermitNonce: string;
    };
  };
};

export const StakeGeneralUiDataFragmentFragmentDoc = gql`
  fragment StakeGeneralUIDataFragment on StakeGeneralUIData {
    aave {
      stakeTokenTotalSupply
      stakeCooldownSeconds
      stakeUnstakeWindow
      stakeTokenPriceEth
      rewardTokenPriceEth
      stakeApy
      distributionPerSecond
      distributionEnd
    }
    bpt {
      stakeTokenTotalSupply
      stakeCooldownSeconds
      stakeUnstakeWindow
      stakeTokenPriceEth
      rewardTokenPriceEth
      stakeApy
      distributionPerSecond
      distributionEnd
    }
    usdPriceEth
  }
`;
export const StakeUserUiDataFragmentFragmentDoc = gql`
  fragment StakeUserUIDataFragment on StakeUserUIData {
    aave {
      stakeTokenUserBalance
      underlyingTokenUserBalance
      userCooldown
      userIncentivesToClaim
      userPermitNonce
    }
    bpt {
      stakeTokenUserBalance
      underlyingTokenUserBalance
      userCooldown
      userIncentivesToClaim
      userPermitNonce
    }
    usdPriceEth
  }
`;
export const C_StakeGeneralUiDataDocument = gql`
  query C_StakeGeneralUIData {
    stakeGeneralUIData {
      ...StakeGeneralUIDataFragment
    }
  }
  ${StakeGeneralUiDataFragmentFragmentDoc}
`;

/**
 * __useC_StakeGeneralUiDataQuery__
 *
 * To run a query within a React component, call `useC_StakeGeneralUiDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_StakeGeneralUiDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_StakeGeneralUiDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useC_StakeGeneralUiDataQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    C_StakeGeneralUiDataQuery,
    C_StakeGeneralUiDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_StakeGeneralUiDataQuery, C_StakeGeneralUiDataQueryVariables>(
    C_StakeGeneralUiDataDocument,
    options
  );
}
export function useC_StakeGeneralUiDataLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    C_StakeGeneralUiDataQuery,
    C_StakeGeneralUiDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    C_StakeGeneralUiDataQuery,
    C_StakeGeneralUiDataQueryVariables
  >(C_StakeGeneralUiDataDocument, options);
}
export type C_StakeGeneralUiDataQueryHookResult = ReturnType<typeof useC_StakeGeneralUiDataQuery>;
export type C_StakeGeneralUiDataLazyQueryHookResult = ReturnType<
  typeof useC_StakeGeneralUiDataLazyQuery
>;
export type C_StakeGeneralUiDataQueryResult = ApolloReactCommon.QueryResult<
  C_StakeGeneralUiDataQuery,
  C_StakeGeneralUiDataQueryVariables
>;
export const C_StakeGeneralUiDataUpdateDocument = gql`
  subscription C_StakeGeneralUIDataUpdate {
    stakeGeneralUIDataUpdate {
      ...StakeGeneralUIDataFragment
    }
  }
  ${StakeGeneralUiDataFragmentFragmentDoc}
`;

/**
 * __useC_StakeGeneralUiDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_StakeGeneralUiDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_StakeGeneralUiDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_StakeGeneralUiDataUpdateSubscription({
 *   variables: {
 *   },
 * });
 */
export function useC_StakeGeneralUiDataUpdateSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<
    C_StakeGeneralUiDataUpdateSubscription,
    C_StakeGeneralUiDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_StakeGeneralUiDataUpdateSubscription,
    C_StakeGeneralUiDataUpdateSubscriptionVariables
  >(C_StakeGeneralUiDataUpdateDocument, options);
}
export type C_StakeGeneralUiDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_StakeGeneralUiDataUpdateSubscription
>;
export type C_StakeGeneralUiDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_StakeGeneralUiDataUpdateSubscription>;
export const C_StakeUserUiDataDocument = gql`
  query C_StakeUserUIData($userAddress: String!, $chainId: Int!) {
    stakeUserUIData(userAddress: $userAddress, chainId: $chainId) {
      ...StakeUserUIDataFragment
    }
  }
  ${StakeUserUiDataFragmentFragmentDoc}
`;

/**
 * __useC_StakeUserUiDataQuery__
 *
 * To run a query within a React component, call `useC_StakeUserUiDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_StakeUserUiDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_StakeUserUiDataQuery({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      chainId: // value for 'chainId'
 *   },
 * });
 */
export function useC_StakeUserUiDataQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    C_StakeUserUiDataQuery,
    C_StakeUserUiDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_StakeUserUiDataQuery, C_StakeUserUiDataQueryVariables>(
    C_StakeUserUiDataDocument,
    options
  );
}
export function useC_StakeUserUiDataLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    C_StakeUserUiDataQuery,
    C_StakeUserUiDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<C_StakeUserUiDataQuery, C_StakeUserUiDataQueryVariables>(
    C_StakeUserUiDataDocument,
    options
  );
}
export type C_StakeUserUiDataQueryHookResult = ReturnType<typeof useC_StakeUserUiDataQuery>;
export type C_StakeUserUiDataLazyQueryHookResult = ReturnType<typeof useC_StakeUserUiDataLazyQuery>;
export type C_StakeUserUiDataQueryResult = ApolloReactCommon.QueryResult<
  C_StakeUserUiDataQuery,
  C_StakeUserUiDataQueryVariables
>;
export const C_StakeUserUiDataUpdateDocument = gql`
  subscription C_StakeUserUIDataUpdate($userAddress: String!, $chainId: Int!) {
    stakeUserUIDataUpdate(userAddress: $userAddress, chainId: $chainId) {
      ...StakeUserUIDataFragment
    }
  }
  ${StakeUserUiDataFragmentFragmentDoc}
`;

/**
 * __useC_StakeUserUiDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_StakeUserUiDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_StakeUserUiDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_StakeUserUiDataUpdateSubscription({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      chainId: // value for 'chainId'
 *   },
 * });
 */
export function useC_StakeUserUiDataUpdateSubscription(
  baseOptions: ApolloReactHooks.SubscriptionHookOptions<
    C_StakeUserUiDataUpdateSubscription,
    C_StakeUserUiDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_StakeUserUiDataUpdateSubscription,
    C_StakeUserUiDataUpdateSubscriptionVariables
  >(C_StakeUserUiDataUpdateDocument, options);
}
export type C_StakeUserUiDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_StakeUserUiDataUpdateSubscription
>;
export type C_StakeUserUiDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_StakeUserUiDataUpdateSubscription>;
