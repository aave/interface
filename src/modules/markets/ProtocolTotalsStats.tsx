import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { useMemo } from 'react';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ProtocolBreakdownEntry, useProtocolTotals } from 'src/hooks/useProtocolTotals';

import { groupByVersion } from './protocolTotalsBreakdown';

const Figure = ({ value }: { value: number }) => (
  <FormattedNumber value={value} symbol="USD" variant="statValue" visibleDecimals={2} compact />
);

const BreakdownTooltip = ({
  rows,
  field,
}: {
  rows: ProtocolBreakdownEntry[];
  field: 'deposits' | 'loans';
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180 }}>
    <Typography variant="description" sx={{ color: 'fg-3' }}>
      <Trans>Across every Aave version and network</Trans>
    </Typography>
    {rows.map((row) => (
      <Box
        key={row.protocol}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}
      >
        <Typography variant="description">{row.protocol}</Typography>
        <FormattedNumber
          value={row[field]}
          symbol="USD"
          variant="description"
          visibleDecimals={2}
          compact
        />
      </Box>
    ))}
  </Box>
);

/**
 * Whole-protocol deposit and loan totals for the markets header, ahead of the
 * market-specific stats. Renders nothing until a reading is available, so an
 * unconfigured or failing source leaves the header exactly as it was.
 */
export const ProtocolTotalsStats = () => {
  const { data } = useProtocolTotals();
  const rows = useMemo(() => (data ? groupByVersion(data.breakdown) : []), [data]);

  if (!data) return null;

  return (
    <>
      <PageHeaderStat
        label={
          <TextWithTooltip text={<Trans>Aave total deposits</Trans>} variant="inherit">
            <BreakdownTooltip rows={rows} field="deposits" />
          </TextWithTooltip>
        }
      >
        <Figure value={data.deposits} />
      </PageHeaderStat>
      <PageHeaderStat
        label={
          <TextWithTooltip text={<Trans>Aave total loans</Trans>} variant="inherit">
            <BreakdownTooltip rows={rows} field="loans" />
          </TextWithTooltip>
        }
      >
        <Figure value={data.loans} />
      </PageHeaderStat>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ display: { xs: 'none', md: 'block' }, borderColor: 'divider' }}
      />
    </>
  );
};
