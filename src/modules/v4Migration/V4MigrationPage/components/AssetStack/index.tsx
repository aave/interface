import { Box } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { figVars } from 'src/utils/figmaColors';

import { MigrationAsset } from '../../utils/types';

interface AssetStackProps {
  assets: MigrationAsset[];
}

export const AssetStack = ({ assets }: AssetStackProps) => (
  <Box sx={{ display: 'flex' }}>
    {assets.map((asset, index) => (
      <TokenIcon
        key={asset.address}
        symbol={
          fetchIconSymbolAndName({
            underlyingAsset: asset.address,
            symbol: asset.symbol,
            name: asset.name,
          }).iconSymbol
        }
        sx={{
          fontSize: '1.5rem',
          ml: index === 0 ? 0 : '-0.25rem',
          boxShadow: `0 0 0 1.5px ${figVars['table-bg']}`,
        }}
      />
    ))}
  </Box>
);
