import { Box, Typography } from '@mui/material';
import { AssetIconStack } from 'src/components/AssetIconStack';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { ConfigRow, ConfigValueKey } from '../../../../utils/configRows';

interface ConfigValueProps {
  row: ConfigRow;
  columnKey: ConfigValueKey;
}

export const ConfigValue = ({ row, columnKey }: ConfigValueProps) => {
  if (columnKey === 'assets') {
    return (
      <Box sx={{ display: 'flex', minWidth: 0 }}>
        {row.assets.length > 0 ? (
          <AssetIconStack assets={row.assets} />
        ) : (
          <Typography variant="h5">-</Typography>
        )}
      </Box>
    );
  }

  if (columnKey === 'supplied') {
    return <FormattedNumber value={row.supplied ?? 0} symbol="USD" compact variant="h5" />;
  }

  return <FormattedNumber value={row[columnKey]} percent variant="h5" visibleDecimals={2} />;
};
