import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { getDisplayIconSymbol } from 'src/ui-config/reservePatches';
import { replaceUnderscoresWithSpaces } from 'src/utils/utils';

export type ConfigAsset = {
  address: string;
  symbol: string;
  iconSymbol: string;
};

export type ConfigRow = {
  id: string;
  configKey: string;
  configLabel: string;
  label: string;
  isEMode: boolean;
  supplied?: number;
  maxLTV: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  assets: ConfigAsset[];
};

export type ConfigSortKey =
  | 'label'
  | 'supplied'
  | 'maxLTV'
  | 'liquidationThreshold'
  | 'liquidationPenalty'
  | 'assets';

export type ConfigValueKey = Exclude<ConfigSortKey, 'label'>;

export const STANDARD_CONFIG_KEY = 'standard';

const eModeConfigKey = (categoryId: number) => `emode-${categoryId}`;

type ReserveEModeInfo = NonNullable<ReserveWithId['eModeInfo']>[number];

export const toEModeRow = (
  eMode: ReserveEModeInfo,
  fields: Pick<ConfigRow, 'maxLTV' | 'assets' | 'supplied'>
): ConfigRow => {
  const label = replaceUnderscoresWithSpaces(eMode.label) ?? eMode.label;
  return {
    id: eModeConfigKey(eMode.categoryId),
    configKey: eModeConfigKey(eMode.categoryId),
    configLabel: label,
    label,
    isEMode: true,
    liquidationThreshold: Number(eMode.liquidationThreshold.value),
    liquidationPenalty: Number(eMode.liquidationPenalty.value),
    ...fields,
  };
};

export const toStandardRow = (
  source: ReserveWithId,
  configLabel: string,
  fields: Pick<ConfigRow, 'id' | 'maxLTV' | 'assets' | 'supplied'>
): ConfigRow => ({
  configKey: STANDARD_CONFIG_KEY,
  configLabel,
  label: `${configLabel} (${source.underlyingToken.symbol})`,
  isEMode: false,
  liquidationThreshold: Number(source.supplyInfo.liquidationThreshold.value),
  liquidationPenalty: Number(source.supplyInfo.liquidationBonus.value),
  ...fields,
});

export const toConfigAsset = (reserve: ReserveWithId): ConfigAsset => {
  const { address, symbol, name } = reserve.underlyingToken;
  return {
    address: address.toLowerCase(),
    symbol,
    iconSymbol: getDisplayIconSymbol({ underlyingAsset: address, symbol, name }),
  };
};

const sortValue = (row: ConfigRow, key: ConfigSortKey): string | number => {
  if (key === 'label') return row.label.toLowerCase();
  if (key === 'assets') return row.assets.length;
  return row[key] ?? 0;
};

export const compareConfigRows = (a: ConfigRow, b: ConfigRow, key: ConfigSortKey) => {
  const aValue = sortValue(a, key);
  const bValue = sortValue(b, key);
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return aValue.localeCompare(bValue);
  }
  return Number(aValue) - Number(bValue);
};
