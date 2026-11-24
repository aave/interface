import { Box, Tooltip, Typography } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { figVars } from 'src/utils/figmaColors';

const MAX_VISIBLE_ICONS = 5;

export interface IconStackAsset {
  symbol: string;
  iconSymbol: string;
  address?: string;
}

interface AssetIconStackProps {
  assets: IconStackAsset[];
}

export const AssetIconStack = ({ assets }: AssetIconStackProps) => {
  const visible = assets.slice(0, MAX_VISIBLE_ICONS);
  const hiddenCount = assets.length - visible.length;

  return (
    <Tooltip title={assets.map((asset) => asset.symbol).join(', ')} placement="top" arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
        {visible.map((asset, index) => (
          <TokenIcon
            key={asset.address ?? asset.symbol}
            symbol={asset.iconSymbol}
            sx={{
              fontSize: '1.25rem',
              ml: index === 0 ? 0 : '-0.5rem',
              zIndex: visible.length - index,
              boxShadow: `0 0 0 1.5px ${figVars['bg-2']}`,
            }}
          />
        ))}
        {hiddenCount > 0 && (
          <Typography variant="subheader2" color="fg-3" sx={{ ml: '0.375rem' }}>
            +{hiddenCount}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};
