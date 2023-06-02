export const USER_TRANSACTIONS_V2_WITH_POOL = `
query UserTransactions($userAddress: String!, $first: Int!, $skip: Int!, $pool: String!) {
  userTransactions(where: { user: $userAddress, pool: $pool }, orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
    id
    timestamp
    txHash
    action
    ... on Deposit {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on RedeemUnderlying {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on Borrow {
      amount
      borrowRateMode
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on UsageAsCollateral {
      fromState
      toState
      reserve {
        symbol
        name
        underlyingAsset
      }
    }
    ... on Repay {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on Swap {
      borrowRateModeFrom
      borrowRateModeTo
      variableBorrowRate
      stableBorrowRate
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
    }
    ... on LiquidationCall {
      collateralAmount
      collateralReserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      principalAmount
      principalReserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      collateralAssetPriceUSD
      borrowAssetPriceUSD
    }
  }
}
`;

export const USER_TRANSACTIONS_V2 = `
query UserTransactions($userAddress: String!, $first: Int!, $skip: Int!) {
  userTransactions(where: { user: $userAddress }, orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
    id
    timestamp
    txHash
    action
    ... on Deposit {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on RedeemUnderlying {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on Borrow {
      amount
      borrowRateMode
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on UsageAsCollateral {
      fromState
      toState
      reserve {
        symbol
        name
        underlyingAsset
      }
    }
    ... on Repay {
      amount
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      assetPriceUSD
    }
    ... on Swap {
      borrowRateModeFrom
      borrowRateModeTo
      variableBorrowRate
      stableBorrowRate
      reserve {
        symbol
        decimals
        name
        underlyingAsset
      }
    }
    ... on LiquidationCall {
      collateralAmount
      collateralReserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      principalAmount
      principalReserve {
        symbol
        decimals
        name
        underlyingAsset
      }
      collateralAssetPriceUSD
      borrowAssetPriceUSD
    }
  }
}
`;
