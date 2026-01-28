import { ReactNode } from 'react';
import { useCompliance } from 'src/hooks/compliance/compliance';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';
import { useDisconnect } from 'wagmi';

import { AddressBlockedModal } from './AddressBlockedModal';

type ComplianceGateProps = {
  children: ReactNode;
};

export const AddressBlocked = ({ children }: ComplianceGateProps) => {
  const { status, recheck, errorMessage } = useCompliance();
  const { currentAccount, readOnlyMode } = useWeb3Context();
  const { disconnect } = useDisconnect();
  const shouldCheck = !readOnlyMode && !ENABLE_TESTNET;

  const showBlockedOverlay = status === 'non-compliant';
  const showErrorOverlay = status === 'error';

  if (!shouldCheck) {
    return <>{children}</>;
  }

  if (!showBlockedOverlay && !showErrorOverlay) {
    return <>{children}</>;
  }

  return (
    <MainLayout>
      <AddressBlockedModal
        address={currentAccount}
        onDisconnectWallet={() => disconnect()}
        isError={showErrorOverlay}
        errorMessage={errorMessage}
        onRetry={showErrorOverlay ? recheck : undefined}
      />
    </MainLayout>
  );
};
