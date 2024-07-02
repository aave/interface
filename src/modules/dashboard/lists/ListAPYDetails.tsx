import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

interface ListAPYDetailsProps {
  underlyingAPY: number;
  supplyAPY?: number;
  borrowAPY?: number;
}

const APYBox = ({ symbol, value }: { symbol: string; value: number }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        alignItems: 'baseline',
      }}
    >
      <Trans>{symbol + ':'}</Trans>
      <IncentivesCard symbol={symbol} value={value} />
    </Box>
  );
};

export const ListAPYDetails = ({ underlyingAPY, supplyAPY, borrowAPY }: ListAPYDetailsProps) => {
  return (
    <TextWithTooltip>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {supplyAPY !== undefined && <APYBox symbol="Supply APY" value={supplyAPY} />}
        {borrowAPY !== undefined && <APYBox symbol="Borrow APY" value={borrowAPY} />}
        <APYBox symbol="Underlying APY" value={underlyingAPY} />
      </Box>
    </TextWithTooltip>
  );
};
