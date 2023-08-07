import { Trans } from '@lingui/macro';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { GhoPieChart, PieChartData } from './GhoPieChart';

export interface GhoPieChartContainer {
  borrowAmount: number | null;
  discountableAmount: number | null;
  baseRate: number;
  discountedAmountRate: number;
  rateAfterDiscount: number;
}

export const GhoPieChartContainer = ({
  borrowAmount,
  discountableAmount,
  baseRate,
  discountedAmountRate,
  rateAfterDiscount,
}: GhoPieChartContainer) => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  const amountAtDiscount = discountableAmount || 0;
  const amountThatExceedsDiscount = Math.max(0, (borrowAmount || 0) - amountAtDiscount);

  const chartData = [
    {
      name: 'amountThatExceedsDiscount',
      value: amountThatExceedsDiscount,
      color: '#B3C7F9',
    },
    {
      name: 'amountAtDiscount',
      value: amountAtDiscount,
      color: '#C9B3F9',
    },
  ];

  if (downToXsm) {
    return (
      <GhoPieChartMobile
        chartData={chartData}
        rateAfterDiscount={rateAfterDiscount}
        baseRate={baseRate}
        amountAtDiscount={amountAtDiscount}
        discountedAmountRate={discountedAmountRate}
        amountThatExceedsDiscount={amountThatExceedsDiscount}
      />
    );
  } else {
    return (
      <GhoPieChartDesktop
        chartData={chartData}
        rateAfterDiscount={rateAfterDiscount}
        baseRate={baseRate}
        amountAtDiscount={amountAtDiscount}
        discountedAmountRate={discountedAmountRate}
        amountThatExceedsDiscount={amountThatExceedsDiscount}
      />
    );
  }
};

interface GhoPieChartProps {
  rateAfterDiscount: number;
  chartData: PieChartData[];
  amountAtDiscount: number;
  discountedAmountRate: number;
  amountThatExceedsDiscount: number;
  baseRate: number;
}

const GhoPieChartDesktop = ({
  rateAfterDiscount,
  chartData,
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: GhoPieChartProps) => {
  const theme = useTheme();

  return (
    <Stack
      direction="column"
      sx={{
        position: 'relative',
        background: theme.palette.background.surface2,
        minWidth: '306px',
        height: '320px',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 2,
        py: 4,
        px: 6,
      }}
    >
      <Stack alignItems="center" gap={1} sx={{ position: 'absolute', top: 65 }}>
        <Typography variant="subheader2">Borrow APY</Typography>
        <FormattedNumber
          variant="h1"
          symbolsColor="text.primary"
          percent
          value={rateAfterDiscount}
          visibleDecimals={2}
        />
      </Stack>
      <GhoPieChart data={chartData} width={156} height={156} />
      <Box>
        <PieChartLegend
          amountAtDiscount={amountAtDiscount}
          discountedAmountRate={discountedAmountRate}
          amountThatExceedsDiscount={amountThatExceedsDiscount}
          baseRate={baseRate}
        />
      </Box>
    </Stack>
  );
};

const GhoPieChartMobile = ({
  rateAfterDiscount,
  chartData,
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: GhoPieChartProps) => {
  const theme = useTheme();

  return (
    <Stack
      direction="column"
      sx={{
        position: 'relative',
        height: '280px',
        background: theme.palette.background.surface2,
        alignItems: 'center',
        borderRadius: 2,
        px: 4,
        pt: 2,
        mb: 2,
      }}
    >
      <Stack alignItems="center" gap={1} sx={{ position: 'absolute', top: 58 }}>
        <Typography variant="subheader2">Borrow APY</Typography>
        <FormattedNumber
          variant="h1"
          symbolsColor="text.primary"
          percent
          value={rateAfterDiscount}
          visibleDecimals={2}
        />
      </Stack>
      <GhoPieChart data={chartData} width={156} height={156} />
      <Box sx={{ width: '100%' }}>
        <PieChartLegend
          amountAtDiscount={amountAtDiscount}
          discountedAmountRate={discountedAmountRate}
          amountThatExceedsDiscount={amountThatExceedsDiscount}
          baseRate={baseRate}
        />
      </Box>
    </Stack>
  );
};

interface PieChartLegendProps {
  amountAtDiscount: number;
  discountedAmountRate: number;
  amountThatExceedsDiscount: number;
  baseRate: number;
}

const PieChartLegend = ({
  amountAtDiscount,
  discountedAmountRate,
  amountThatExceedsDiscount,
  baseRate,
}: PieChartLegendProps) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              [`& .${tableCellClasses.root}`]: {
                py: 2,
                lineHeight: 0,
              },
            }}
          >
            <TableCell align="left" sx={{ pl: 0 }}>
              <Typography variant="helperText">
                <Trans>Borrow balance</Trans>
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="helperText">
                <Trans>Amount</Trans>
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ pr: 0 }}>
              <Typography variant="helperText">APY</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            sx={{
              pt: 8,
              [`& .${tableCellClasses.root}`]: {
                borderBottom: 'none',
                pt: 3,
                pb: 2,
              },
            }}
          >
            <TableCell align="left" sx={{ pl: 0, py: 1 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    background: '#C9B3F9',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                  }}
                />
                <Typography variant="caption">
                  <Trans>At a discount</Trans>
                </Typography>
              </Stack>
            </TableCell>
            <TableCell align="right">
              <FormattedNumber variant="subheader2" value={amountAtDiscount} align="right" />
            </TableCell>
            <TableCell sx={{ pr: 0 }} align="right">
              <FormattedNumber
                variant="subheader2"
                value={discountedAmountRate}
                percent
                visibleDecimals={2}
              />
            </TableCell>
          </TableRow>
          <TableRow
            sx={{
              [`& .${tableCellClasses.root}`]: {
                borderBottom: 'none',
              },
            }}
          >
            <TableCell align="left" sx={{ pl: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    background: '#B3C7F9',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption">
                  <Trans>Exceeds the discount</Trans>
                </Typography>
              </Stack>
            </TableCell>
            <TableCell align="right">
              <FormattedNumber
                variant="subheader2"
                visibleDecimals={2}
                value={amountThatExceedsDiscount}
              />
            </TableCell>
            <TableCell sx={{ pr: 0 }} align="right">
              <FormattedNumber variant="subheader2" value={baseRate} percent />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
