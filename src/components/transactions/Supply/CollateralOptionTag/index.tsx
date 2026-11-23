import { Trans } from '@lingui/macro';
import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { onAccent } from 'src/utils/figmaColors';

interface CollateralOptionTagProps {
  kind: 'active' | 'default' | 'isolated';
}

export const CollateralOptionTag = ({ kind }: CollateralOptionTagProps) => {
  const tags: Record<CollateralOptionTagProps['kind'], { color: string; label: ReactNode }> = {
    active: { color: 'success.main', label: <Trans>Active</Trans> },
    default: { color: 'fg-2', label: <Trans>Default</Trans> },
    isolated: { color: 'warning.main', label: <Trans>Isolated</Trans> },
  };

  const tag = (
    <Typography
      variant="caption"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: '4px',
        bgcolor: tags[kind].color,
        color: onAccent,
        fontSize: '10px',
        flexShrink: 0,
      }}
    >
      {tags[kind].label}
    </Typography>
  );

  if (kind !== 'isolated') return tag;

  return (
    <Tooltip
      title={
        <Trans>
          Only the listed collateral contributes borrowing power in this category — other collateral
          you hold will have 0% LTV while in it.
        </Trans>
      }
      arrow
    >
      {tag}
    </Tooltip>
  );
};
