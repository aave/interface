import { ChainId } from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export type RightHelperTextProps = {
  approvalHash: string | null;
  actionHash: string | null;
  chainId: ChainId;
  usePermit: boolean;
};

export const RightHelperText = ({
  approvalHash,
  actionHash,
  chainId,
  usePermit,
}: RightHelperTextProps) => {
  const networkConfig = getNetworkConfig(chainId);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      {approvalHash && !actionHash && !usePermit && (
        <Typography
          component={Link}
          variant="helperText"
          href={networkConfig.explorerLinkBuilder({ tx: approvalHash })}
          target="_blank"
        >
          <>
            <Trans>Review approve tx details</Trans>
            <SvgIcon sx={{ ml: '2px' }} fontSize="small">
              <ExternalLinkIcon />
            </SvgIcon>
          </>
        </Typography>
      )}
      {actionHash && (
        <Typography
          component={Link}
          variant="helperText"
          href={networkConfig.explorerLinkBuilder({ tx: actionHash })}
          target="_blank"
        >
          <div>
            <Trans>Review supply tx details</Trans>
            <SvgIcon sx={{ ml: '2px' }} fontSize="small">
              <ExternalLinkIcon />
            </SvgIcon>
          </div>
        </Typography>
      )}
    </Box>
  );
};
