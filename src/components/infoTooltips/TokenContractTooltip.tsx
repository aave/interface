import { IconButton } from '@mui/material';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';

import { Link } from '../primitives/Link';
import { DarkTooltip } from './DarkTooltip';

export const TokenContractTooltip = ({ explorerUrl }: { explorerUrl: string }) => (
  <DarkTooltip title="View token contract" sx={{ display: { xsm: 'none' } }}>
    <IconButton LinkComponent={Link} href={explorerUrl} sx={{ height: '24px', width: '24px' }}>
      <ArrowUpRightIcon sx={{ fontSize: '14px' }} />
    </IconButton>
  </DarkTooltip>
);
