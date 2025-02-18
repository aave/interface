import { generateAliases } from 'src/utils/generateSubgraphQueryAlias';

export const constructIndexHistoryQuery = (underlyingAssets: string[]): string => {
  const aliases = generateAliases(underlyingAssets.length);

  const queries = underlyingAssets.map(
    (asset, index) => `
      ${aliases[index]}: reserveParamsHistoryItems(
        where: { timestamp_lt: $timestamp, reserve_: { underlyingAsset: "${asset.toLowerCase()}" } },
        orderBy: timestamp,
        orderDirection: desc,
        first: 1
      ) {
        liquidityIndex
        liquidityRate
        variableBorrowRate
        variableBorrowIndex
        timestamp
        reserve {
          underlyingAsset
        }
      }
    `
  );

  return `
    query IndexHistory($timestamp: Int!) {
      ${queries.join('\n')}
    }
  `;
};
