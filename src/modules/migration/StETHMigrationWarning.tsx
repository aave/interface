import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const StETHMigrationWarning = () => {
  return (
    <Warning
      icon={false}
      sx={{
        backgroundColor: 'error.200',
      }}
    >
      <Typography color="error.100" variant="caption">
        <Trans>
          stETH asset will be migrated as Wrapped stETH using Lido Protocol exchange which leads to
          supply balance change after migration 19.000(19000$)
        </Trans>
      </Typography>
    </Warning>
  );
};
