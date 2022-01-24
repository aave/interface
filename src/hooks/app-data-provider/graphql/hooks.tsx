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
  lendingPoolAddressProvider: Scalars['String'];
};

export type QueryReservesIncentivesArgs = {
  lendingPoolAddressProvider: Scalars['String'];
};

export type QueryStakeUserUiDataArgs = {
  userAddress: Scalars['String'];
};

export type QueryUserDataArgs = {
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type QueryUserIncentivesArgs = {
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
  priceInMarketReferenceCurrency: Scalars['String'];
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
  lendingPoolAddressProvider: Scalars['String'];
};

export type SubscriptionProtocolDataUpdateArgs = {
  lendingPoolAddressProvider: Scalars['String'];
};

export type SubscriptionStakeUserUiDataUpdateArgs = {
  userAddress: Scalars['String'];
};

export type SubscriptionUserDataUpdateArgs = {
  lendingPoolAddressProvider: Scalars['String'];
  userAddress: Scalars['String'];
};

export type SubscriptionUserPoolIncentivesDataUpdateArgs = {
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
  sTokenIncentivesUserData: UserIncentiveData;
  underlyingAsset: Scalars['String'];
  vTokenIncentivesUserData: UserIncentiveData;
};

export type UserReserveData = {
  __typename?: 'UserReserveData';
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

export type IncentivesDataFragmentFragment = {
  __typename?: 'IncentiveData';
  incentiveControllerAddress: string;
  tokenAddress: string;
  rewardsTokenInformation: Array<{
    __typename?: 'RewardInfo';
    emissionEndTimestamp: number;
    emissionPerSecond: string;
    incentivesLastUpdateTimestamp: number;
    precision: number;
    priceFeedDecimals: number;
    tokenIncentivesIndex: string;
    rewardPriceFeed: string;
    rewardTokenAddress: string;
    rewardTokenDecimals: number;
    rewardOracleAddress: string;
    rewardTokenSymbol: string;
  }>;
};

export type C_ReservesIncentivesQueryVariables = Exact<{
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_ReservesIncentivesQuery = {
  __typename?: 'Query';
  reservesIncentives: Array<{
    __typename?: 'ReserveIncentivesData';
    underlyingAsset: string;
    aIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
    vIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
    sIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
  }>;
};

export type C_PoolIncentivesDataUpdateSubscriptionVariables = Exact<{
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_PoolIncentivesDataUpdateSubscription = {
  __typename?: 'Subscription';
  poolIncentivesDataUpdate: Array<{
    __typename?: 'ReserveIncentivesData';
    underlyingAsset: string;
    aIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
    vIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
    sIncentiveData: {
      __typename?: 'IncentiveData';
      incentiveControllerAddress: string;
      tokenAddress: string;
      rewardsTokenInformation: Array<{
        __typename?: 'RewardInfo';
        emissionEndTimestamp: number;
        emissionPerSecond: string;
        incentivesLastUpdateTimestamp: number;
        precision: number;
        priceFeedDecimals: number;
        tokenIncentivesIndex: string;
        rewardPriceFeed: string;
        rewardTokenAddress: string;
        rewardTokenDecimals: number;
        rewardOracleAddress: string;
        rewardTokenSymbol: string;
      }>;
    };
  }>;
};

export type ReserveDataFragmentFragment = {
  __typename?: 'ReserveData';
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  usageAsCollateralEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveFactor: string;
  interestRateStrategyAddress: string;
  baseLTVasCollateral: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  lastUpdateTimestamp: number;
  priceInMarketReferenceCurrency: string;
  isPaused: boolean;
  accruedToTreasury: string;
  unbacked: string;
  isolationModeTotalDebt: string;
  debtCeiling: string;
  debtCeilingDecimals: number;
  eModeCategoryId: number;
  borrowCap: string;
  supplyCap: string;
  eModeLtv: number;
  eModeLiquidationThreshold: number;
  eModeLiquidationBonus: number;
  eModePriceSource: string;
  eModeLabel: string;
  borrowableInIsolation: boolean;
};

export type BaseCurrencyDataFragmentFragment = {
  __typename?: 'BaseCurrencyData';
  marketReferenceCurrencyDecimals: number;
  marketReferenceCurrencyPriceInUsd: string;
  networkBaseTokenPriceInUsd: string;
  networkBaseTokenPriceDecimals: number;
};

export type C_ProtocolDataQueryVariables = Exact<{
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_ProtocolDataQuery = {
  __typename?: 'Query';
  protocolData: {
    __typename?: 'ProtocolData';
    reserves: Array<{
      __typename?: 'ReserveData';
      id: string;
      underlyingAsset: string;
      name: string;
      symbol: string;
      decimals: number;
      isActive: boolean;
      isFrozen: boolean;
      usageAsCollateralEnabled: boolean;
      aTokenAddress: string;
      stableDebtTokenAddress: string;
      variableDebtTokenAddress: string;
      borrowingEnabled: boolean;
      stableBorrowRateEnabled: boolean;
      reserveFactor: string;
      interestRateStrategyAddress: string;
      baseLTVasCollateral: string;
      stableRateSlope1: string;
      stableRateSlope2: string;
      averageStableRate: string;
      stableDebtLastUpdateTimestamp: number;
      variableRateSlope1: string;
      variableRateSlope2: string;
      liquidityIndex: string;
      reserveLiquidationThreshold: string;
      reserveLiquidationBonus: string;
      variableBorrowIndex: string;
      variableBorrowRate: string;
      availableLiquidity: string;
      stableBorrowRate: string;
      liquidityRate: string;
      totalPrincipalStableDebt: string;
      totalScaledVariableDebt: string;
      lastUpdateTimestamp: number;
      priceInMarketReferenceCurrency: string;
      isPaused: boolean;
      accruedToTreasury: string;
      unbacked: string;
      isolationModeTotalDebt: string;
      debtCeiling: string;
      debtCeilingDecimals: number;
      eModeCategoryId: number;
      borrowCap: string;
      supplyCap: string;
      eModeLtv: number;
      eModeLiquidationThreshold: number;
      eModeLiquidationBonus: number;
      eModePriceSource: string;
      eModeLabel: string;
      borrowableInIsolation: boolean;
    }>;
    baseCurrencyData: {
      __typename?: 'BaseCurrencyData';
      marketReferenceCurrencyDecimals: number;
      marketReferenceCurrencyPriceInUsd: string;
      networkBaseTokenPriceInUsd: string;
      networkBaseTokenPriceDecimals: number;
    };
  };
};

export type C_ProtocolDataUpdateSubscriptionVariables = Exact<{
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_ProtocolDataUpdateSubscription = {
  __typename?: 'Subscription';
  protocolDataUpdate: {
    __typename?: 'ProtocolData';
    reserves: Array<{
      __typename?: 'ReserveData';
      id: string;
      underlyingAsset: string;
      name: string;
      symbol: string;
      decimals: number;
      isActive: boolean;
      isFrozen: boolean;
      usageAsCollateralEnabled: boolean;
      aTokenAddress: string;
      stableDebtTokenAddress: string;
      variableDebtTokenAddress: string;
      borrowingEnabled: boolean;
      stableBorrowRateEnabled: boolean;
      reserveFactor: string;
      interestRateStrategyAddress: string;
      baseLTVasCollateral: string;
      stableRateSlope1: string;
      stableRateSlope2: string;
      averageStableRate: string;
      stableDebtLastUpdateTimestamp: number;
      variableRateSlope1: string;
      variableRateSlope2: string;
      liquidityIndex: string;
      reserveLiquidationThreshold: string;
      reserveLiquidationBonus: string;
      variableBorrowIndex: string;
      variableBorrowRate: string;
      availableLiquidity: string;
      stableBorrowRate: string;
      liquidityRate: string;
      totalPrincipalStableDebt: string;
      totalScaledVariableDebt: string;
      lastUpdateTimestamp: number;
      priceInMarketReferenceCurrency: string;
      isPaused: boolean;
      accruedToTreasury: string;
      unbacked: string;
      isolationModeTotalDebt: string;
      debtCeiling: string;
      debtCeilingDecimals: number;
      eModeCategoryId: number;
      borrowCap: string;
      supplyCap: string;
      eModeLtv: number;
      eModeLiquidationThreshold: number;
      eModeLiquidationBonus: number;
      eModePriceSource: string;
      eModeLabel: string;
      borrowableInIsolation: boolean;
    }>;
    baseCurrencyData: {
      __typename?: 'BaseCurrencyData';
      marketReferenceCurrencyDecimals: number;
      marketReferenceCurrencyPriceInUsd: string;
      networkBaseTokenPriceInUsd: string;
      networkBaseTokenPriceDecimals: number;
    };
  };
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

export type UserReserveDataFragmentFragment = {
  __typename?: 'UserReserveData';
  underlyingAsset: string;
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
  stableBorrowRate: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
};

export type C_UserDataQueryVariables = Exact<{
  userAddress: Scalars['String'];
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_UserDataQuery = {
  __typename?: 'Query';
  userData: {
    __typename?: 'UserReservesData';
    userEmodeCategoryId: number;
    userReserves: Array<{
      __typename?: 'UserReserveData';
      underlyingAsset: string;
      scaledATokenBalance: string;
      usageAsCollateralEnabledOnUser: boolean;
      scaledVariableDebt: string;
      stableBorrowRate: string;
      principalStableDebt: string;
      stableBorrowLastUpdateTimestamp: number;
    }>;
  };
};

export type C_UserDataUpdateSubscriptionVariables = Exact<{
  userAddress: Scalars['String'];
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_UserDataUpdateSubscription = {
  __typename?: 'Subscription';
  userDataUpdate: {
    __typename?: 'UserReservesData';
    userEmodeCategoryId: number;
    userReserves: Array<{
      __typename?: 'UserReserveData';
      underlyingAsset: string;
      scaledATokenBalance: string;
      usageAsCollateralEnabledOnUser: boolean;
      scaledVariableDebt: string;
      stableBorrowRate: string;
      principalStableDebt: string;
      stableBorrowLastUpdateTimestamp: number;
    }>;
  };
};

export type TokenIncentivesUserDataFragmentFragment = {
  __typename?: 'UserIncentiveData';
  tokenAddress: string;
  incentiveControllerAddress: string;
  userRewardsInformation: Array<{
    __typename?: 'UserRewardInfo';
    rewardTokenSymbol: string;
    rewardOracleAddress: string;
    rewardTokenAddress: string;
    userUnclaimedRewards: string;
    tokenIncentivesUserIndex: string;
    rewardPriceFeed: string;
    priceFeedDecimals: number;
    rewardTokenDecimals: number;
  }>;
};

export type C_UserIncentivesQueryVariables = Exact<{
  userAddress: Scalars['String'];
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_UserIncentivesQuery = {
  __typename?: 'Query';
  userIncentives: Array<{
    __typename?: 'UserIncentivesData';
    underlyingAsset: string;
    aTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
    vTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
    sTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
  }>;
};

export type C_UserPoolIncentivesDataUpdateSubscriptionVariables = Exact<{
  userAddress: Scalars['String'];
  lendingPoolAddressProvider: Scalars['String'];
}>;

export type C_UserPoolIncentivesDataUpdateSubscription = {
  __typename?: 'Subscription';
  userPoolIncentivesDataUpdate: Array<{
    __typename?: 'UserIncentivesData';
    underlyingAsset: string;
    aTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
    vTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
    sTokenIncentivesUserData: {
      __typename?: 'UserIncentiveData';
      tokenAddress: string;
      incentiveControllerAddress: string;
      userRewardsInformation: Array<{
        __typename?: 'UserRewardInfo';
        rewardTokenSymbol: string;
        rewardOracleAddress: string;
        rewardTokenAddress: string;
        userUnclaimedRewards: string;
        tokenIncentivesUserIndex: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardTokenDecimals: number;
      }>;
    };
  }>;
};

export const IncentivesDataFragmentFragmentDoc = gql`
  fragment IncentivesDataFragment on IncentiveData {
    incentiveControllerAddress
    tokenAddress
    rewardsTokenInformation {
      emissionEndTimestamp
      emissionPerSecond
      incentivesLastUpdateTimestamp
      precision
      priceFeedDecimals
      tokenIncentivesIndex
      rewardPriceFeed
      rewardTokenAddress
      rewardTokenDecimals
      rewardOracleAddress
      rewardTokenSymbol
    }
  }
`;
export const ReserveDataFragmentFragmentDoc = gql`
  fragment ReserveDataFragment on ReserveData {
    id
    underlyingAsset
    name
    symbol
    decimals
    isActive
    isFrozen
    usageAsCollateralEnabled
    aTokenAddress
    stableDebtTokenAddress
    variableDebtTokenAddress
    borrowingEnabled
    stableBorrowRateEnabled
    reserveFactor
    interestRateStrategyAddress
    baseLTVasCollateral
    stableRateSlope1
    stableRateSlope2
    averageStableRate
    stableDebtLastUpdateTimestamp
    variableRateSlope1
    variableRateSlope2
    liquidityIndex
    reserveLiquidationThreshold
    reserveLiquidationBonus
    variableBorrowIndex
    variableBorrowRate
    availableLiquidity
    stableBorrowRate
    liquidityRate
    totalPrincipalStableDebt
    totalScaledVariableDebt
    lastUpdateTimestamp
    priceInMarketReferenceCurrency
    isPaused
    accruedToTreasury
    unbacked
    isolationModeTotalDebt
    debtCeiling
    debtCeilingDecimals
    eModeCategoryId
    borrowCap
    supplyCap
    eModeLtv
    eModeLiquidationThreshold
    eModeLiquidationBonus
    eModePriceSource
    eModeLabel
    borrowableInIsolation
  }
`;
export const BaseCurrencyDataFragmentFragmentDoc = gql`
  fragment BaseCurrencyDataFragment on BaseCurrencyData {
    marketReferenceCurrencyDecimals
    marketReferenceCurrencyPriceInUsd
    networkBaseTokenPriceInUsd
    networkBaseTokenPriceDecimals
  }
`;
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
export const UserReserveDataFragmentFragmentDoc = gql`
  fragment UserReserveDataFragment on UserReserveData {
    underlyingAsset
    scaledATokenBalance
    usageAsCollateralEnabledOnUser
    scaledVariableDebt
    stableBorrowRate
    principalStableDebt
    stableBorrowLastUpdateTimestamp
  }
`;
export const TokenIncentivesUserDataFragmentFragmentDoc = gql`
  fragment TokenIncentivesUserDataFragment on UserIncentiveData {
    tokenAddress
    incentiveControllerAddress
    userRewardsInformation {
      rewardTokenSymbol
      rewardOracleAddress
      rewardTokenAddress
      userUnclaimedRewards
      tokenIncentivesUserIndex
      rewardPriceFeed
      priceFeedDecimals
      rewardTokenDecimals
    }
  }
`;
export const C_ReservesIncentivesDocument = gql`
  query C_ReservesIncentives($lendingPoolAddressProvider: String!) {
    reservesIncentives(lendingPoolAddressProvider: $lendingPoolAddressProvider) {
      underlyingAsset
      aIncentiveData {
        ...IncentivesDataFragment
      }
      vIncentiveData {
        ...IncentivesDataFragment
      }
      sIncentiveData {
        ...IncentivesDataFragment
      }
    }
  }
  ${IncentivesDataFragmentFragmentDoc}
`;

/**
 * __useC_ReservesIncentivesQuery__
 *
 * To run a query within a React component, call `useC_ReservesIncentivesQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_ReservesIncentivesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_ReservesIncentivesQuery({
 *   variables: {
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_ReservesIncentivesQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    C_ReservesIncentivesQuery,
    C_ReservesIncentivesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_ReservesIncentivesQuery, C_ReservesIncentivesQueryVariables>(
    C_ReservesIncentivesDocument,
    options
  );
}
export function useC_ReservesIncentivesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    C_ReservesIncentivesQuery,
    C_ReservesIncentivesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    C_ReservesIncentivesQuery,
    C_ReservesIncentivesQueryVariables
  >(C_ReservesIncentivesDocument, options);
}
export type C_ReservesIncentivesQueryHookResult = ReturnType<typeof useC_ReservesIncentivesQuery>;
export type C_ReservesIncentivesLazyQueryHookResult = ReturnType<
  typeof useC_ReservesIncentivesLazyQuery
>;
export type C_ReservesIncentivesQueryResult = ApolloReactCommon.QueryResult<
  C_ReservesIncentivesQuery,
  C_ReservesIncentivesQueryVariables
>;
export const C_PoolIncentivesDataUpdateDocument = gql`
  subscription C_PoolIncentivesDataUpdate($lendingPoolAddressProvider: String!) {
    poolIncentivesDataUpdate(lendingPoolAddressProvider: $lendingPoolAddressProvider) {
      underlyingAsset
      aIncentiveData {
        ...IncentivesDataFragment
      }
      vIncentiveData {
        ...IncentivesDataFragment
      }
      sIncentiveData {
        ...IncentivesDataFragment
      }
    }
  }
  ${IncentivesDataFragmentFragmentDoc}
`;

/**
 * __useC_PoolIncentivesDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_PoolIncentivesDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_PoolIncentivesDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_PoolIncentivesDataUpdateSubscription({
 *   variables: {
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_PoolIncentivesDataUpdateSubscription(
  baseOptions: ApolloReactHooks.SubscriptionHookOptions<
    C_PoolIncentivesDataUpdateSubscription,
    C_PoolIncentivesDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_PoolIncentivesDataUpdateSubscription,
    C_PoolIncentivesDataUpdateSubscriptionVariables
  >(C_PoolIncentivesDataUpdateDocument, options);
}
export type C_PoolIncentivesDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_PoolIncentivesDataUpdateSubscription
>;
export type C_PoolIncentivesDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_PoolIncentivesDataUpdateSubscription>;
export const C_ProtocolDataDocument = gql`
  query C_ProtocolData($lendingPoolAddressProvider: String!) {
    protocolData(lendingPoolAddressProvider: $lendingPoolAddressProvider) {
      reserves {
        ...ReserveDataFragment
      }
      baseCurrencyData {
        ...BaseCurrencyDataFragment
      }
    }
  }
  ${ReserveDataFragmentFragmentDoc}
  ${BaseCurrencyDataFragmentFragmentDoc}
`;

/**
 * __useC_ProtocolDataQuery__
 *
 * To run a query within a React component, call `useC_ProtocolDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_ProtocolDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_ProtocolDataQuery({
 *   variables: {
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_ProtocolDataQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<C_ProtocolDataQuery, C_ProtocolDataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_ProtocolDataQuery, C_ProtocolDataQueryVariables>(
    C_ProtocolDataDocument,
    options
  );
}
export function useC_ProtocolDataLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    C_ProtocolDataQuery,
    C_ProtocolDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<C_ProtocolDataQuery, C_ProtocolDataQueryVariables>(
    C_ProtocolDataDocument,
    options
  );
}
export type C_ProtocolDataQueryHookResult = ReturnType<typeof useC_ProtocolDataQuery>;
export type C_ProtocolDataLazyQueryHookResult = ReturnType<typeof useC_ProtocolDataLazyQuery>;
export type C_ProtocolDataQueryResult = ApolloReactCommon.QueryResult<
  C_ProtocolDataQuery,
  C_ProtocolDataQueryVariables
>;
export const C_ProtocolDataUpdateDocument = gql`
  subscription C_ProtocolDataUpdate($lendingPoolAddressProvider: String!) {
    protocolDataUpdate(lendingPoolAddressProvider: $lendingPoolAddressProvider) {
      reserves {
        ...ReserveDataFragment
      }
      baseCurrencyData {
        ...BaseCurrencyDataFragment
      }
    }
  }
  ${ReserveDataFragmentFragmentDoc}
  ${BaseCurrencyDataFragmentFragmentDoc}
`;

/**
 * __useC_ProtocolDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_ProtocolDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_ProtocolDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_ProtocolDataUpdateSubscription({
 *   variables: {
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_ProtocolDataUpdateSubscription(
  baseOptions: ApolloReactHooks.SubscriptionHookOptions<
    C_ProtocolDataUpdateSubscription,
    C_ProtocolDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_ProtocolDataUpdateSubscription,
    C_ProtocolDataUpdateSubscriptionVariables
  >(C_ProtocolDataUpdateDocument, options);
}
export type C_ProtocolDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_ProtocolDataUpdateSubscription
>;
export type C_ProtocolDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_ProtocolDataUpdateSubscription>;
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
  query C_StakeUserUIData($userAddress: String!) {
    stakeUserUIData(userAddress: $userAddress) {
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
  subscription C_StakeUserUIDataUpdate($userAddress: String!) {
    stakeUserUIDataUpdate(userAddress: $userAddress) {
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
export const C_UserDataDocument = gql`
  query C_UserData($userAddress: String!, $lendingPoolAddressProvider: String!) {
    userData(userAddress: $userAddress, lendingPoolAddressProvider: $lendingPoolAddressProvider) {
      userReserves {
        ...UserReserveDataFragment
      }
      userEmodeCategoryId
    }
  }
  ${UserReserveDataFragmentFragmentDoc}
`;

/**
 * __useC_UserDataQuery__
 *
 * To run a query within a React component, call `useC_UserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_UserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_UserDataQuery({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_UserDataQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<C_UserDataQuery, C_UserDataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_UserDataQuery, C_UserDataQueryVariables>(
    C_UserDataDocument,
    options
  );
}
export function useC_UserDataLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<C_UserDataQuery, C_UserDataQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<C_UserDataQuery, C_UserDataQueryVariables>(
    C_UserDataDocument,
    options
  );
}
export type C_UserDataQueryHookResult = ReturnType<typeof useC_UserDataQuery>;
export type C_UserDataLazyQueryHookResult = ReturnType<typeof useC_UserDataLazyQuery>;
export type C_UserDataQueryResult = ApolloReactCommon.QueryResult<
  C_UserDataQuery,
  C_UserDataQueryVariables
>;
export const C_UserDataUpdateDocument = gql`
  subscription C_UserDataUpdate($userAddress: String!, $lendingPoolAddressProvider: String!) {
    userDataUpdate(
      userAddress: $userAddress
      lendingPoolAddressProvider: $lendingPoolAddressProvider
    ) {
      userReserves {
        ...UserReserveDataFragment
      }
      userEmodeCategoryId
    }
  }
  ${UserReserveDataFragmentFragmentDoc}
`;

/**
 * __useC_UserDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_UserDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_UserDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_UserDataUpdateSubscription({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_UserDataUpdateSubscription(
  baseOptions: ApolloReactHooks.SubscriptionHookOptions<
    C_UserDataUpdateSubscription,
    C_UserDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_UserDataUpdateSubscription,
    C_UserDataUpdateSubscriptionVariables
  >(C_UserDataUpdateDocument, options);
}
export type C_UserDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_UserDataUpdateSubscription
>;
export type C_UserDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_UserDataUpdateSubscription>;
export const C_UserIncentivesDocument = gql`
  query C_UserIncentives($userAddress: String!, $lendingPoolAddressProvider: String!) {
    userIncentives(
      userAddress: $userAddress
      lendingPoolAddressProvider: $lendingPoolAddressProvider
    ) {
      underlyingAsset
      aTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
      vTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
      sTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
    }
  }
  ${TokenIncentivesUserDataFragmentFragmentDoc}
`;

/**
 * __useC_UserIncentivesQuery__
 *
 * To run a query within a React component, call `useC_UserIncentivesQuery` and pass it any options that fit your needs.
 * When your component renders, `useC_UserIncentivesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_UserIncentivesQuery({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_UserIncentivesQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    C_UserIncentivesQuery,
    C_UserIncentivesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<C_UserIncentivesQuery, C_UserIncentivesQueryVariables>(
    C_UserIncentivesDocument,
    options
  );
}
export function useC_UserIncentivesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    C_UserIncentivesQuery,
    C_UserIncentivesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<C_UserIncentivesQuery, C_UserIncentivesQueryVariables>(
    C_UserIncentivesDocument,
    options
  );
}
export type C_UserIncentivesQueryHookResult = ReturnType<typeof useC_UserIncentivesQuery>;
export type C_UserIncentivesLazyQueryHookResult = ReturnType<typeof useC_UserIncentivesLazyQuery>;
export type C_UserIncentivesQueryResult = ApolloReactCommon.QueryResult<
  C_UserIncentivesQuery,
  C_UserIncentivesQueryVariables
>;
export const C_UserPoolIncentivesDataUpdateDocument = gql`
  subscription C_UserPoolIncentivesDataUpdate(
    $userAddress: String!
    $lendingPoolAddressProvider: String!
  ) {
    userPoolIncentivesDataUpdate(
      userAddress: $userAddress
      lendingPoolAddressProvider: $lendingPoolAddressProvider
    ) {
      underlyingAsset
      aTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
      vTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
      sTokenIncentivesUserData {
        ...TokenIncentivesUserDataFragment
      }
    }
  }
  ${TokenIncentivesUserDataFragmentFragmentDoc}
`;

/**
 * __useC_UserPoolIncentivesDataUpdateSubscription__
 *
 * To run a query within a React component, call `useC_UserPoolIncentivesDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useC_UserPoolIncentivesDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useC_UserPoolIncentivesDataUpdateSubscription({
 *   variables: {
 *      userAddress: // value for 'userAddress'
 *      lendingPoolAddressProvider: // value for 'lendingPoolAddressProvider'
 *   },
 * });
 */
export function useC_UserPoolIncentivesDataUpdateSubscription(
  baseOptions: ApolloReactHooks.SubscriptionHookOptions<
    C_UserPoolIncentivesDataUpdateSubscription,
    C_UserPoolIncentivesDataUpdateSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSubscription<
    C_UserPoolIncentivesDataUpdateSubscription,
    C_UserPoolIncentivesDataUpdateSubscriptionVariables
  >(C_UserPoolIncentivesDataUpdateDocument, options);
}
export type C_UserPoolIncentivesDataUpdateSubscriptionHookResult = ReturnType<
  typeof useC_UserPoolIncentivesDataUpdateSubscription
>;
export type C_UserPoolIncentivesDataUpdateSubscriptionResult =
  ApolloReactCommon.SubscriptionResult<C_UserPoolIncentivesDataUpdateSubscription>;
