import { t, Trans } from '@lingui/macro';
import { Box, ButtonBase, Skeleton, Theme, Typography } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { BigNumber } from 'bignumber.js';
import { ReactNode, useState } from 'react';
import { FormattedNumber, getCompactDecimals } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SearchInput } from 'src/components/SearchInput';
import { figVars } from 'src/utils/figmaColors';
import { insetHighlightActive, insetHighlightBase } from 'src/utils/insetHighlight';

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

const LIST_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  mx: '-0.625rem',
  px: '0.625rem',
} as const;

const GROUP_LABEL_SX = {
  display: 'block',
  mb: '0.25rem',
  fontSize: '0.6875rem',
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: 'fg-3',
} as const;

const rowSx = (theme: Theme): SystemStyleObject<Theme> => ({
  ...insetHighlightBase({ theme, radius: '0.5rem', left: '-0.625rem', right: '-0.625rem' }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '0.75rem',
  width: '100%',
  height: '4rem',
  textAlign: 'left',
  '&:hover::before, &.Mui-focusVisible::before': insetHighlightActive(
    figVars['table-item-hover-2']
  ),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '3.5rem',
    right: 0,
    bottom: 0,
    height: '1px',
    backgroundColor: figVars['border-0'],
  },
  '&:last-of-type::after, &:hover::after, &:has(+ :hover)::after': { display: 'none' },
});

const CONTENT_SX = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
} as const;

const LEFT_SX = { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 0 } as const;
const RIGHT_SX = { ...LEFT_SX, alignItems: 'flex-end' } as const;

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
    <ButtonBase onClick={() => onSelect(asset)} sx={rowSx}>
      <TokenIcon symbol={asset.iconSymbol ?? asset.symbol} sx={{ fontSize: '2.75rem' }} />
      <Box sx={CONTENT_SX}>
        <Box sx={LEFT_SX}>
          <Typography component="span" variant="h5" color="fg-1" noWrap>
            {asset.name}
          </Typography>
          <Typography component="span" variant="base" color="fg-3">
            {asset.symbol}
          </Typography>
        </Box>
        <Box sx={RIGHT_SX}>
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
        </Box>
      </Box>
    </ButtonBase>
  );
};

const SkeletonRow = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '4rem' }}>
    <Skeleton variant="circular" width={44} height={44} />
    <Box sx={{ ...LEFT_SX, flex: 1 }}>
      <Skeleton variant="rectangular" width={96} height={14} sx={{ borderRadius: '0.25rem' }} />
      <Skeleton variant="rectangular" width={48} height={14} sx={{ borderRadius: '0.25rem' }} />
    </Box>
  </Box>
);

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
  const trimmed = query.trim();

  return (
    <Box sx={ROOT_SX}>
      <SearchInput
        size="large"
        placeholder={t`Search assets`}
        onSearchTermChange={setQuery}
        wrapperSx={{ width: '100%', flexShrink: 0 }}
      />
      <Box sx={LIST_SX}>
        {loading ? (
          <Box>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Box>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <Box key={group.key}>
              <Typography variant="inherit" component="h3" sx={GROUP_LABEL_SX}>
                {group.label}
              </Typography>
              {group.assets.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} onSelect={onSelect} />
              ))}
            </Box>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              py: '3rem',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" color="fg-1">
              {trimmed ? (
                <Trans>No Results Found for “{trimmed}”</Trans>
              ) : (
                <Trans>No assets found</Trans>
              )}
            </Typography>
            {trimmed && (
              <Typography variant="base" color="fg-3">
                <Trans>Try adjusting your search</Trans>
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
