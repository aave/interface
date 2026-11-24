import { Trans } from '@lingui/macro';
import { Box, keyframes, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { AutoResizer } from 'src/components/AutoResizer';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { Spinner } from 'src/components/Spinner';
import type { TxStatus } from 'src/components/transactions/FlowCommons/TxStatusHeader';
import { CARD_SURFACE_SX, figSurfaceShadow, figVars, onAccent } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

import { StatusBar } from './components/StatusBar';

export type { TxStatus };

export interface TransactionCardRow {
  id: string;
  label: ReactNode;
  tooltip?: ReactNode;
  value?: ReactNode;
  loading?: boolean;
}

export interface TransactionCardProps {
  status: TxStatus;
  icon: ReactNode;
  title: ReactNode;
  rows: TransactionCardRow[];
  metadata?: TransactionCardRow[];
  explorerHref?: string;
  explorerLabel?: ReactNode;
  footer?: ReactNode;
}

const STATUS_LABELS: Record<TxStatus, ReactNode> = {
  pending: <Trans>Pending</Trans>,
  success: <Trans>Success</Trans>,
  error: <Trans>Error</Trans>,
  cancelled: <Trans>Cancelled</Trans>,
  expired: <Trans>Expired</Trans>,
};

const shimmer = keyframes`
  0% { mask-position: 200% 0; }
  100% { mask-position: -200% 0; }
`;

const ROOT_SX = { display: 'flex', flexDirection: 'column', gap: '2rem' } as const;

const CARD_SX = {
  ...CARD_SURFACE_SX,
  position: 'relative',
  overflow: 'hidden',
  isolation: 'isolate',
  boxShadow: figSurfaceShadow(),
} as const;

const HEADER_SX = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  p: '0.87rem 0.75rem 0.3805rem',
} as const;

const STATUS_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  ...darkScheme({ filter: `drop-shadow(0 0 0.25rem ${figVars['table-bg']})` }),
  '&[data-status="pending"]': { '--tx-status-color': figVars['data-purple'] },
  '&[data-status="success"]': { '--tx-status-color': figVars['data-green'] },
  '&[data-status="error"]': { '--tx-status-color': figVars['data-red'] },
  '&[data-status="cancelled"], &[data-status="expired"]': { '--tx-status-color': figVars['fg-3'] },
} as const;

const STATUS_ICON_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  color: onAccent,
  backgroundColor: 'var(--tx-status-color)',
  transition: 'background-color 200ms ease',
} as const;

const STATUS_TEXT_SX = {
  typography: 'h5',
  color: 'var(--tx-status-color)',
  transition: 'color 100ms ease',
} as const;

const EXPLORER_SX = {
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: '0.25rem',
  color: 'fg-3',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1,
  textDecoration: 'none',
} as const;

const HERO_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  p: '2.53125rem 1rem 3.606rem',
  borderBottom: '1px solid',
  borderColor: 'border-0',
  textAlign: 'center',
  '& h2': { transition: 'transform 300ms ease', willChange: 'transform' },
  '&[data-pending="true"] h2': {
    transform: 'scale(0.9)',
    maskImage:
      'linear-gradient(90deg, #000000 0%, #000000 20%, #00000090 40%, #00000090 60%, #000000 80%, #000000 100%)',
    maskSize: '200% 100%',
    animation: `${shimmer} 2s linear infinite`,
  },
} as const;

const METADATA_SX = {
  bgcolor: 'bg-2',
  borderTop: '1px solid',
  borderColor: 'border-0',
  py: '0.25rem',
  '--description-item-padding': '0.875rem 0',
} as const;

const Rows = ({ rows, secondary }: { rows: TransactionCardRow[]; secondary?: boolean }) => (
  <div>
    {rows.map((row) => (
      <DescriptionItem
        key={row.id}
        label={row.label}
        labelTooltip={row.tooltip}
        value={row.value}
        isLoading={row.loading}
        valueTone={secondary ? 'secondary' : 'primary'}
      />
    ))}
  </div>
);

export const TransactionCard = ({
  status,
  icon,
  title,
  rows,
  metadata,
  explorerHref,
  explorerLabel = <Trans>Explorer</Trans>,
  footer,
}: TransactionCardProps) => (
  <Box sx={ROOT_SX}>
    <Box sx={CARD_SX}>
      <StatusBar status={status} />
      <AutoResizer duration={400}>
        <Box sx={HEADER_SX}>
          <Box data-status={status} sx={STATUS_SX}>
            <Box sx={STATUS_ICON_SX}>
              <Spinner
                size={13.33}
                state={
                  status === 'pending' ? 'pending' : status === 'success' ? 'success' : 'failure'
                }
              />
            </Box>
            <Typography component="span" variant="inherit" sx={STATUS_TEXT_SX}>
              {STATUS_LABELS[status]}
            </Typography>
          </Box>
          {explorerHref ? (
            <Box
              component="a"
              href={explorerHref}
              target="_blank"
              rel="noopener noreferrer"
              sx={EXPLORER_SX}
            >
              {explorerLabel}
              <ArrowUpRightIcon sx={{ fontSize: '1rem', color: 'fg-chevron' }} />
            </Box>
          ) : null}
        </Box>
        <Box data-pending={status === 'pending'} sx={HERO_SX}>
          {icon}
          <Typography variant="h2" component="h2" color="fg-1">
            {title}
          </Typography>
        </Box>
        <Rows rows={rows} />
        {metadata?.length ? (
          <Box sx={METADATA_SX}>
            <Rows rows={metadata} secondary />
          </Box>
        ) : null}
      </AutoResizer>
    </Box>
    {footer}
  </Box>
);
