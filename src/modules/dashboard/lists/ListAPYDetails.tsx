import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

interface ListAPYDetailsProps {
  supplyAPY: number;
  underlyingAPY: number;
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

export const ListAPYDetails = ({ supplyAPY, underlyingAPY }: ListAPYDetailsProps) => {
  return (
    <TextWithTooltip>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <APYBox symbol="Supply APY" value={supplyAPY} />
        <APYBox symbol="Underlying APY" value={underlyingAPY} />
      </Box>
    </TextWithTooltip>
  );
};
