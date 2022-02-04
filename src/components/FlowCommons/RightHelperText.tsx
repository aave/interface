import { ChainId } from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Link } from '@mui/material';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export type RightHelperTextProps = {
  approvalHash?: string;
  actionHash?: string;
  chainId: ChainId;
  usePermit?: boolean;
  action: string;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({
  approvalHash,
  actionHash,
  chainId,
  usePermit,
  action,
}: RightHelperTextProps) => {
  const networkConfig = getNetworkConfig(chainId);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      {approvalHash && !actionHash && !usePermit && (
        <Link
          variant="helperText"
          href={networkConfig.explorerLinkBuilder({ tx: approvalHash })}
          target="_blank"
          sx={{ display: 'inline-flex', alignItems: 'center' }}
          underline={'hover'}
        >
          <Trans>Review approve tx details</Trans>
          <ExtLinkIcon />
        </Link>
      )}
      {actionHash && (
        <Link
          variant="helperText"
          href={networkConfig.explorerLinkBuilder({ tx: actionHash })}
          sx={{ display: 'inline-flex', alignItems: 'center' }}
          underline="hover"
          rel="noopener"
          target="_blank"
        >
          <Trans>Review {action} tx details</Trans>
          <ExtLinkIcon />
        </Link>
      )}
    </Box>
  );
};
