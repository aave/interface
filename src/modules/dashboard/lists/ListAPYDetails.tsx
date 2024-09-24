import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { Side } from 'src/utils/utils';

interface ListAPYDetailsProps {
  underlyingAPY: number;
  apy: number;
  side: Side;
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

export const ListAPYDetails = ({ underlyingAPY, apy, side }: ListAPYDetailsProps) => {
  return (
    <TextWithTooltip>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <APYBox
          symbol={side == Side.SUPPLY ? 'Supply APY' : side == Side.BORROW ? 'Borrow APY' : ''}
          value={apy}
        />
        <APYBox symbol="Underlying APY" value={underlyingAPY} />
      </Box>
    </TextWithTooltip>
  );
};
