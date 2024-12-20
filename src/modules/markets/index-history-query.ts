export const INDEX_HISTORY = `
query IndexHistory($timestamp: Int!) {
  reserveParamsHistoryItems(where:{timestamp_lt: $timestamp}, orderBy: timestamp, orderDirection: desc){
    liquidityIndex
    liquidityRate
    variableBorrowRate
    variableBorrowIndex
    timestamp
    reserve{
		  underlyingAsset
    }
  }
}
`;
