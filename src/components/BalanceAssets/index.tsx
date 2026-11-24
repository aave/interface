import { t, Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ReactNode, useState } from 'react';
import {
  AssetList,
  AssetListEmpty,
  AssetListGroup,
  AssetListItem,
  AssetListItemSkeleton,
} from 'src/components/AssetListItem';
import { FormattedNumber, getCompactDecimals } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SearchInput } from 'src/components/SearchInput';

export interface BalanceAsset {
  symbol: string;
  name: string;
  iconSymbol?: string;
  balance: string | number;
  balanceUSD: number;
}

const ROOT_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.375rem',
  flex: 1,
  minHeight: 0,
} as const;

const matchesQuery = (asset: BalanceAsset, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || asset.symbol.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q);
};

const AssetRow = <T extends BalanceAsset>({
  asset,
  onSelect,
}: {
  asset: T;
  onSelect: (asset: T) => void;
}) => {
  const balance = new BigNumber(asset.balance);
  const price = balance.gt(0) ? asset.balanceUSD / balance.toNumber() : 0;

  return (
    <AssetListItem
      onClick={() => onSelect(asset)}
      icon={<TokenIcon symbol={asset.iconSymbol ?? asset.symbol} sx={{ fontSize: '2.75rem' }} />}
      left={
        <>
          <Typography component="span" variant="h5" color="fg-1" noWrap>
            {asset.name}
          </Typography>
          <Typography component="span" variant="base" color="fg-3">
            {asset.symbol}
          </Typography>
        </>
      }
      right={
        <>
          <FormattedNumber
            component="span"
            value={balance.toString()}
            visibleDecimals={getCompactDecimals(balance, price)}
            symbol={asset.symbol}
            variant="h5"
            color="fg-1"
          />
          <FormattedNumber
            component="span"
            value={asset.balanceUSD}
            symbol="USD"
            variant="base"
            color="fg-3"
          />
        </>
      }
    />
  );
};

interface BalanceAssetsProps<T extends BalanceAsset> {
  supportedAssets: T[];
  supportedLabel?: ReactNode;
  otherAssets?: T[];
  loading?: boolean;
  onSelect: (asset: T) => void;
}

export const BalanceAssets = <T extends BalanceAsset>({
  supportedAssets,
  supportedLabel = <Trans>Supported Assets</Trans>,
  otherAssets = [],
  loading,
  onSelect,
}: BalanceAssetsProps<T>) => {
  const [query, setQuery] = useState('');
  const groups = [
    { key: 'supported', label: supportedLabel, assets: supportedAssets },
    { key: 'other', label: <Trans>More Tokens</Trans>, assets: otherAssets },
  ]
    .map((group) => ({ ...group, assets: group.assets.filter((a) => matchesQuery(a, query)) }))
    .filter((group) => group.assets.length > 0);

  return (
    <Box sx={ROOT_SX}>
      <SearchInput
        size="large"
        placeholder={t`Search assets`}
        onSearchTermChange={setQuery}
        wrapperSx={{ width: '100%', flexShrink: 0 }}
      />
      <AssetList>
        {loading ? (
          <Box>
            <AssetListItemSkeleton />
            <AssetListItemSkeleton />
            <AssetListItemSkeleton />
          </Box>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <AssetListGroup key={group.key} label={group.label}>
              {group.assets.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} onSelect={onSelect} />
              ))}
            </AssetListGroup>
          ))
        ) : (
          <AssetListEmpty query={query} fallback={<Trans>No assets found</Trans>} />
        )}
      </AssetList>
    </Box>
  );
};
