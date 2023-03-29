export const USER_TRANSACTIONS_V2 = `
query UserTransactions($userAddress: String!) {
  userTransactions(where: { user: $userAddress }, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    txHash
    action
    ... on Deposit {
      amount
      reserve {
        symbol
        decimals
      }
      assetPriceUSD
    }
    ... on RedeemUnderlying {
      amount
      reserve {
        symbol
        decimals
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
      }
      assetPriceUSD
    }
    ... on UsageAsCollateral {
      fromState
      toState
      reserve {
        symbol
      }
    }
    ... on Repay {
      amount
      reserve {
        symbol
        decimals
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
      }
    }
    ... on LiquidationCall {
      collateralAmount
      collateralReserve {
        symbol
        decimals
      }
      principalAmount
      principalReserve {
        symbol
        decimals
      }
      collateralAssetPriceUSD
      borrowAssetPriceUSD
    }
  }
}
`;