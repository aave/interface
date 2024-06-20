import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

interface ListAPYDetailsProps {
  supplyAPY: number;
  underlyingAPY: number;
}

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '6px',
            alignItems: 'baseline',
          }}
        >
          <Trans>{'Supply APY:'}</Trans>
          <IncentivesCard symbol={'Supply APY'} value={supplyAPY} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '6px',
            alignItems: 'baseline',
          }}
        >
          <Trans>{'Underlying APY:'}</Trans>
          <IncentivesCard symbol={'Underlying APY'} value={underlyingAPY} />{' '}
        </Box>
      </Box>
    </TextWithTooltip>
  );
};
