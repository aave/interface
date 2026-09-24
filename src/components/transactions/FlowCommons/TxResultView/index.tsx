import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { TxResultActions } from '../TxResultActions';
import { TxStatus, TxStatusHeader } from '../TxStatusHeader';

export type TxResultStatus = Exclude<TxStatus, 'error'>;

export type TxResultViewProps = {
  status: TxResultStatus;
  txHash?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  hideTx?: boolean;
  customExplorerLink?: string;
  customExplorerLinkText?: ReactNode;
  onClose?: () => void;
};

const DEFAULT_TITLES: Record<TxResultStatus, ReactNode> = {
  success: <Trans>All done</Trans>,
  pending: <Trans>In Progress</Trans>,
  cancelled: <Trans>Transaction Cancelled</Trans>,
  expired: <Trans>Transaction Expired</Trans>,
};

export const TxResultView = ({
  status,
  txHash,
  title,
  description,
  children,
  hideTx,
  customExplorerLink,
  customExplorerLinkText,
  onClose,
}: TxResultViewProps) => {
  const { close, mainTxState } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  const explorerHref = hideTx
    ? undefined
    : customExplorerLink ||
      currentNetworkConfig.explorerLinkBuilder({ tx: txHash ? txHash : mainTxState.txHash });

  return (
    <>
      <TxStatusHeader
        status={status}
        title={title ?? DEFAULT_TITLES[status]}
        description={description}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</Box>

      <TxResultActions
        explorerHref={explorerHref}
        explorerLabel={customExplorerLinkText}
        explorerDisabled={status === 'pending' && !txHash}
        onClose={onClose ?? close}
      />
    </>
  );
};
