import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApprovalMethodToggleButton } from 'src/components/transactions/FlowCommons/ApprovalMethodToggleButton';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';

import { MaxApprovalSwitch } from './MaxApprovalSwitch';

export type RightHelperTextProps = {
  approvalHash?: string;
  tryPermit?: boolean;
  amount?: string;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const RightHelperText = ({ approvalHash, tryPermit, amount }: RightHelperTextProps) => {
  const { walletApprovalMethodPreference, setWalletApprovalMethodPreference } = useRootStore();
  const { maxApprovalPreference, setMaxApprovalPreference } = useRootStore();
  const [showSwitch, setShowSwitch] = useState(false);
  const usingPermit = tryPermit && walletApprovalMethodPreference;
  const { currentNetworkConfig } = useProtocolDataContext();
  const { type } = useModalContext();
  const isSigned = approvalHash === MOCK_SIGNED_HASH;

  useEffect(() => {
    setShowSwitch(showMaxApprovalSwitch());
  }, [amount, walletApprovalMethodPreference]);

  const showMaxApprovalSwitch = () => {
    if (type === ModalType.Supply && walletApprovalMethodPreference === ApprovalMethod.APPROVE) {
      return true;
    }
    if (amount === '-1') {
      setMaxApprovalPreference(true);
      return true;
    }
    if (type === ModalType.Repay && walletApprovalMethodPreference === ApprovalMethod.APPROVE) {
      return true;
    }
    return false;
  };

  // a signature is not submitted on-chain so there is no link to review
  if (!approvalHash && !isSigned && tryPermit)
    return (
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', mb: 2 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Approve with</Trans>&nbsp;
          </Typography>
          <ApprovalMethodToggleButton
            currentMethod={walletApprovalMethodPreference}
            setMethod={(method: ApprovalMethod) => setWalletApprovalMethodPreference(method)}
          />
        </Box>
        {showSwitch && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subheader2" color="text.secondary">
              <Trans>Approve Maximum</Trans>&nbsp;
            </Typography>
            <MaxApprovalSwitch
              currentMethod={maxApprovalPreference}
              setMethod={(method: boolean) => setMaxApprovalPreference(method)}
              allowToSwitch={amount === '-1' ? false : true}
            />
          </Box>
        )}
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
