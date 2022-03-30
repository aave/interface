import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon } from '@mui/material';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export type RightHelperTextProps = {
  approvalHash?: string;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({ approvalHash }: RightHelperTextProps) => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const isSigned = approvalHash === MOCK_SIGNED_HASH;
  // a signature will not be reviewable on etherscan
  if (!approvalHash || isSigned) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {approvalHash && (
        <Link
          variant="helperText"
          href={currentNetworkConfig.explorerLinkBuilder({ tx: approvalHash })}
          sx={{ display: 'inline-flex', alignItems: 'center' }}
          underline="hover"
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Review approval tx details</Trans>
          <ExtLinkIcon />
        </Link>
      )}
    </Box>
  );
};
