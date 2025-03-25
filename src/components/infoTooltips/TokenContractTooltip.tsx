import { ExternalLinkIcon } from '@heroicons/react/outline';
import { IconButton, SvgIcon } from '@mui/material';

import { Link } from '../primitives/Link';
import { DarkTooltip } from './DarkTooltip';

export const TokenContractTooltip = ({ explorerUrl }: { explorerUrl: string }) => (
  <DarkTooltip title="View token contract" sx={{ display: { xsm: 'none' } }}>
    <IconButton LinkComponent={Link} href={explorerUrl} sx={{ height: '24px', width: '24px' }}>
      <SvgIcon sx={{ fontSize: '14px' }}>
        <ExternalLinkIcon />
      </SvgIcon>
    </IconButton>
  </DarkTooltip>
);
