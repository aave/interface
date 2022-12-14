import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { ApprovalMethodToggleButton } from 'src/components/transactions/FlowCommons/ApprovalMethodToggleButton';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';

export type RightHelperTextProps = {
  approvalHash?: string;
  tryPermit?: boolean;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({ approvalHash, tryPermit }: RightHelperTextProps) => {
  const [walletApprovalMethodPreference, setWalletApprovalMethodPreference] = useRootStore(
    (state) => [state.walletApprovalMethodPreference, state.setWalletApprovalMethodPreference]
  );
  const { currentNetworkConfig } = useProtocolDataContext();
  const isSigned = approvalHash === MOCK_SIGNED_HASH;
  // a signature is not submitted on-chain so there is no link to review
  if (!approvalHash || (isSigned && tryPermit))
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Approve with</Trans>&nbsp;
        </Typography>
        <ApprovalMethodToggleButton
          currentMethod={walletApprovalMethodPreference}
          setMethod={(method: ApprovalMethod) => setWalletApprovalMethodPreference(method)}
        />
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
