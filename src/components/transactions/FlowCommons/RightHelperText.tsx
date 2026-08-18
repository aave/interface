import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect } from 'react';
import { ApprovalMethodToggleButton } from 'src/components/transactions/FlowCommons/ApprovalMethodToggleButton';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useRootStore } from 'src/store/root';
import { ApprovalAmount, ApprovalMethod } from 'src/store/walletSlice';
import { useShallow } from 'zustand/shallow';

import { PermitNonceInfo } from './PermitNonceInfo';

export type RightHelperTextProps = {
  approvalHash?: string;
  tryPermit?: boolean;
  permitInUse?: boolean;
  /**
   * Offer a choice between approving the exact amount and an unlimited allowance. Without
   * this the control stays hidden for tokens that do not support permit, leaving those
   * flows with no way to cap an approval.
   */
  showApprovalAmountToggle?: boolean;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({
  approvalHash,
  tryPermit,
  permitInUse = false,
  showApprovalAmountToggle = false,
}: RightHelperTextProps) => {
  const [
    account,
    walletApprovalMethodPreference,
    setWalletApprovalMethodPreference,
    walletApprovalAmountPreference,
    setWalletApprovalAmountPreference,
    currentNetworkConfig,
  ] = useRootStore(
    useShallow((store) => [
      store.account,
      store.walletApprovalMethodPreference,
      store.setWalletApprovalMethodPreference,
      store.walletApprovalAmountPreference,
      store.setWalletApprovalAmountPreference,
      store.currentNetworkConfig,
    ])
  );
  const { data: isContractAddress } = useIsContractAddress(account);
  const usingPermit = tryPermit && walletApprovalMethodPreference;
  const isSigned = approvalHash === MOCK_SIGNED_HASH;

  /**
   * If these conditions are met, it updates the wallet approval method preference to APPROVE as default.
   * This is done because smart contract accounts do not support the PERMIT method.
   */
  useEffect(() => {
    if (isContractAddress && walletApprovalMethodPreference === ApprovalMethod.PERMIT) {
      setWalletApprovalMethodPreference(ApprovalMethod.APPROVE);
    }
  }, [isContractAddress]);

  // a signature is not submitted on-chain so there is no link to review
  if (!approvalHash && !isSigned && (tryPermit || showApprovalAmountToggle))
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Approve with</Trans>&nbsp;
        </Typography>
        <ApprovalMethodToggleButton
          // Without permit the stored preference is meaningless, so show what will happen.
          currentMethod={tryPermit ? walletApprovalMethodPreference : ApprovalMethod.APPROVE}
          setMethod={(method: ApprovalMethod) => setWalletApprovalMethodPreference(method)}
          permitAvailable={!!tryPermit}
          showAmountOptions={showApprovalAmountToggle}
          currentAmount={walletApprovalAmountPreference}
          setAmount={(amount: ApprovalAmount) => setWalletApprovalAmountPreference(amount)}
        />
      </Box>
    );
  // When permit use is disabled by the flow, inform the user why
  if (!tryPermit && permitInUse)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <PermitNonceInfo />
      </Box>
    );
  if (approvalHash && !usingPermit)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          pb: 1,
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
