import { Trans } from '@lingui/macro';
import { ButtonBase, SxProps, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';

interface ShowMoreButtonProps {
  expanded: boolean;
  label: ReactNode;
  onClick: () => void;
  sx?: SxProps<Theme>;
}

export const ShowMoreButton = ({ expanded, label, onClick, sx }: ShowMoreButtonProps) => (
  <ButtonBase
    onClick={onClick}
    aria-expanded={expanded}
    sx={[
      {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '0.75rem',
        width: '100%',
        minHeight: '3rem',
        px: '1rem',
        textAlign: 'left',
        '&:hover': { bgcolor: 'button-hover' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <ChevronDownIcon
      sx={{
        fontSize: '1rem',
        color: 'fg-chevron',
        transform: expanded ? 'rotate(180deg)' : undefined,
      }}
    />
    <Typography variant="h5">{expanded ? <Trans>Show less</Trans> : label}</Typography>
  </ButtonBase>
);
