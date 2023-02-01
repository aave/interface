import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { NoData } from 'src/components/primitives/NoData';
import { Warning } from 'src/components/primitives/Warning';

const calculateValues = (v2Amount: string, v2Price: string, v3Price?: string) => {
  if (!v3Price) return { v3Amount: undefined, v3TotalPrice: undefined };
  const v2PriceBn = valueToBigNumber(v2Price);
  const ratio = v2PriceBn.div(v3Price);
  const v3Amount = ratio.multipliedBy(v2Amount);
  const v3TotalPrice = v3Amount.multipliedBy(v3Price);

  return { v3Amount: v3Amount.toString(), v3TotalPrice: v3TotalPrice.toString() };
};

type StETHMigrationWarningProps = {
  v3Price?: string;
  v2Price: string;
  v2Amount: string;
};

export const StETHMigrationWarning: React.FC<StETHMigrationWarningProps> = ({
  v2Amount,
  v2Price,
  v3Price,
}) => {
  const { v3Amount, v3TotalPrice } = useMemo(
    () => calculateValues(v2Amount, v2Price, v3Price),
    [v2Amount, v2Price, v3Price]
  );

  return (
    <Warning
      icon={false}
      sx={{
        backgroundColor: 'error.200',
        mb: 4,
      }}
    >
      <Typography color="error.100" variant="caption" component="span">
        <Trans>
          stETH tokens will be migrated to Wrapped stETH using Lido Protocol wrapper which leads to
          supply balance change after migration:{' '}
          {v3Amount ? (
            <>
              <FormattedNumber variant="caption" value={v3Amount} />
              {' ('}
              <FormattedNumber
                variant="caption"
                value={v3TotalPrice}
                symbol="USD"
                color="error.100"
                symbolsColor="error.100"
              />
              {').'}
            </>
          ) : (
            <NoData variant="caption" color="error.100" component="span" />
          )}
        </Trans>{' '}
      </Typography>
    </Warning>
  );
};
