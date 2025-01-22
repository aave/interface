export const GHO_RATE_HISTORY_QUERY = `
query GHORateHistory {
  {
    reserveConfigurationHistoryItems(where: {reserve_: {symbol: "GHO"}}){
      timestamp
      reserveInterestRateStrategy
    }
    }
}
`;
