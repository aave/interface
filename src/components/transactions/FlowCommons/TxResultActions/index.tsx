import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { useHideModalCloseButton } from 'src/components/primitives/BasicModal';
import { isExternalHref } from 'src/components/primitives/Link';

interface TxResultActionsProps {
  explorerHref?: string;
  explorerLabel?: ReactNode;
  explorerDisabled?: boolean;
  closeLabel?: ReactNode;
  onClose: () => void;
}

export const TxResultActions = ({
  explorerHref,
  explorerLabel,
  explorerDisabled,
  closeLabel,
  onClose,
}: TxResultActionsProps) => {
  useHideModalCloseButton();
  const external = !!explorerHref && isExternalHref(explorerHref);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', mt: '1.5rem' }}>
      {explorerHref && (
        <Button
          variant="outlined"
          size="large"
          disabled={explorerDisabled}
          href={explorerHref}
          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          endIcon={
            external && !explorerDisabled ? <ArrowUpRightIcon sx={{ color: 'fg-3' }} /> : undefined
          }
        >
          {explorerLabel ? explorerLabel : <Trans>Review Transaction</Trans>}
        </Button>
      )}

      <Button onClick={onClose} variant="contained" size="large" data-cy="closeButton">
        {closeLabel ?? <Trans>Done</Trans>}
      </Button>
    </Box>
  );
};
