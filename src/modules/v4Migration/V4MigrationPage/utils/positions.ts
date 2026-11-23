import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { MigrationAsset } from './types';

export type SortValue = string | number;

export const sortPositions = <T>(
  positions: T[],
  getSortValue: ((position: T) => SortValue) | undefined,
  desc: boolean
) => {
  if (!getSortValue) return positions;

  return [...positions].sort((a, b) => {
    const aValue = getSortValue(a);
    const bValue = getSortValue(b);
    const order =
      typeof aValue === 'string' && typeof bValue === 'string'
        ? aValue.localeCompare(bValue)
        : Number(aValue) - Number(bValue);
    return desc ? -order : order;
  });
};

export const assetMatchesSearch = (asset: MigrationAsset, searchTerm: string) => {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;
  return (
    asset.symbol.toLowerCase().includes(term) ||
    asset.name.toLowerCase().includes(term) ||
    asset.address.toLowerCase().includes(term)
  );
};

export const getAssetIconSymbol = (asset: MigrationAsset) =>
  fetchIconSymbolAndName({
    underlyingAsset: asset.address,
    symbol: asset.symbol,
    name: asset.name,
  }).iconSymbol;
