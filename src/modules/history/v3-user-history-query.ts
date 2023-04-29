export const USER_TRANSACTIONS_V3 = `
query UserTransactions($userAddress: String!) {
  userTransactions(where: { user: $userAddress }, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    txHash
    action
    ... on Supply {
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
      borrowRate
      stableTokenDebt
      variableTokenDebt
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
    ... on SwapBorrowRate {
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
