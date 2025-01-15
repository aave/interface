import { generateAliases } from 'src/utils/generateSubgraphQueryAlias';

export const constructIndexCurrentQuery = (underlyingAssets: string[]): string => {
  const aliases = generateAliases(underlyingAssets.length);

  const queries = underlyingAssets.map(
    (asset, index) => `
      ${aliases[index]}: reserveParamsHistoryItems(
        orderBy: timestamp,
        orderDirection: desc,
        first: 1,
        where: { reserve_: { underlyingAsset: "${asset.toLowerCase()}" } }
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
    query IndexCurrent {
      ${queries.join('\n')}
    }
  `;
};
