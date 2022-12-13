import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export type RightHelperTextProps = {
  approvalHash?: string;
  approvalMethodToggleButton: ReactNode;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({
  approvalHash,
  approvalMethodToggleButton,
}: RightHelperTextProps) => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const isSigned = approvalHash === MOCK_SIGNED_HASH;
  // a signature is not submitted on-chain so there is no link to review
  if (!approvalHash || isSigned)
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Approve with</Trans>&nbsp;
        </Typography>
        {approvalMethodToggleButton}
      </Box>
    );

  if (approvalHash)
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
            rel="noreferrer noopener"
          >
            <Trans>Review approval tx details</Trans>
            <ExtLinkIcon />
          </Link>
        )}
      </Box>
    );
  return <></>;
};
