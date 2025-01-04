export const INDEX_CURRENT = `
query IndexCurrent {
  reserveParamsHistoryItems(orderBy: timestamp, orderDirection: desc){
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
