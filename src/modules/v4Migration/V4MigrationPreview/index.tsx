import { Box, ButtonBase, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { MouseEvent, ReactNode, useId, useState } from 'react';
import { SKELETON } from 'src/components/DynamicCard/DescriptionItem';
import { AaveLogo } from 'src/components/icons/AaveLogo';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';
import { InfoLabel } from 'src/components/InfoLabel';
import { NoData } from 'src/components/primitives/NoData';
import { CARD_SURFACE_SX, figVars } from 'src/utils/figmaColors';
import { motion as motionTokens } from 'src/utils/motion';

export interface V4MigrationPreviewRow {
  id: string;
  label?: ReactNode;
  tooltip?: ReactNode;
  v3?: ReactNode;
  v4?: ReactNode;
  loading?: boolean;
  details?: V4MigrationPreviewRow[];
}

export interface V4MigrationPreviewProps {
  rows: V4MigrationPreviewRow[];
  title?: ReactNode;
}

const INSET = '1.25rem';
const GUTTER = '1.75rem';
const V4_WIDTH = '12.25rem';

const ROOT_SX = { display: 'flex', flexDirection: 'column', gap: '0.875rem' } as const;

const TITLE_SX = {
  display: 'flex',
  alignItems: 'center',
  minHeight: '1.25rem',
  fontSize: '0.6875rem',
  fontWeight: 500,
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: 'fg-4',
} as const;

const CARD_SX = { ...CARD_SURFACE_SX, overflowX: 'auto' } as const;

const TABLE_SX = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 'max-content',
  '--label-inset': INSET,
  '&[data-gutter="true"]': { '--label-inset': `calc(${INSET} + ${GUTTER})` },
} as const;

const ROW_SX = {
  position: 'relative',
  display: 'flex',
  height: '3.125rem',
  '&[data-header]': { height: '3rem' },
  '&[data-detail]': { height: '3.25rem' },
  '&[data-divider]::after': {
    content: '""',
    position: 'absolute',
    left: 'var(--label-inset)',
    right: INSET,
    bottom: 0,
    height: '1px',
    bgcolor: 'border-0',
  },
  '&[data-header]::after': { left: INSET },
  '&:has(+ [data-open="true"])::after': { opacity: 0 },
  '&[data-expandable]': { cursor: 'pointer' },
  '&[data-expandable]:hover [data-chevron]': { color: 'fg-1' },
} as const;

const GROUP_SX = {
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '0.625rem',
    right: '0.625rem',
    borderRadius: '0.5rem',
    bgcolor: 'migration-selected-0',
    opacity: 0,
    transition: `opacity 400ms ${motionTokens.easing.smooth}`,
  },
  '&[data-open="true"]::before': { opacity: 1 },
} as const;

const LABEL_CELL_SX = {
  flex: '1 0 auto',
  display: 'flex',
  alignItems: 'center',
  pl: INSET,
} as const;

const GUTTER_SX = { width: GUTTER, flexShrink: 0, display: 'flex', alignItems: 'center' } as const;

const CHEVRON_SX = {
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '0.25rem',
  color: 'fg-4',
  transition: `color ${motionTokens.duration.hover}ms ${motionTokens.easing.standard}`,
  '&.Mui-focusVisible': { color: 'fg-1', outline: '2px solid currentColor' },
} as const;

const VALUE_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '0.5rem',
  typography: 'h5',
  color: 'fg-1',
  whiteSpace: 'nowrap',
} as const;

const V3_CELL_SX = { ...VALUE_SX, flex: 'none', px: '1rem' } as const;

const V4_CELL_SX = {
  ...VALUE_SX,
  position: 'relative',
  flex: 'none',
  width: V4_WIDTH,
  pl: '1rem',
  pr: INSET,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    bgcolor: 'border-0',
  },
  '[data-divider] > &::before': { bottom: '1px' },
} as const;

const EXPAND_TRANSITION = { duration: 0.25, ease: motionTokens.bezier.smooth } as const;

const LOGO_SX = { display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'fg-1' } as const;

const TAG_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '1rem',
  px: '0.40625rem',
  borderRadius: '1rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  lineHeight: 1,
} as const;

const VERSION_TAG_SX = {
  V3: { ...TAG_SX, color: 'fg-3', boxShadow: `inset 0 0 0 1.5px ${figVars['fg-3']}` },
  V4: {
    ...TAG_SX,
    color: 'purple-1',
    boxShadow: `inset 0 0 0 1.5px ${figVars['migration-v4-tag-ring']}`,
  },
} as const;

const VersionLogo = ({ version }: { version: keyof typeof VERSION_TAG_SX }) => (
  <Box role="img" aria-label={`Aave ${version}`} sx={LOGO_SX}>
    <AaveLogo width="4.5625rem" height="0.75rem" />
    <Box component="span" sx={VERSION_TAG_SX[version]}>
      {version}
    </Box>
  </Box>
);

const Cell = ({ value, loading }: { value: ReactNode; loading?: boolean }) =>
  loading ? SKELETON : value == null ? <NoData color="fg-4" /> : <>{value}</>;

const PreviewRow = ({
  row,
  gutter,
  divider,
  detail,
}: {
  row: V4MigrationPreviewRow;
  gutter: boolean;
  divider: boolean;
  detail?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const details = row.details ?? [];
  const expandable = details.length > 0;
  const toggle = () => setOpen((current) => !current);
  const toggleFromRow = (event: MouseEvent) => {
    if (!(event.target as Element).closest('a, button, input')) toggle();
  };

  const line = (
    <Box
      role="row"
      data-divider={divider || open || undefined}
      data-detail={detail || undefined}
      data-expandable={expandable || undefined}
      onClick={expandable ? toggleFromRow : undefined}
      sx={ROW_SX}
    >
      <Box role="rowheader" sx={LABEL_CELL_SX}>
        {gutter ? (
          <Box sx={GUTTER_SX}>
            {expandable ? (
              <ButtonBase
                data-chevron
                onClick={toggle}
                aria-expanded={open}
                aria-controls={`${id}details`}
                aria-labelledby={`${id}label`}
                sx={CHEVRON_SX}
              >
                <motion.span
                  animate={{ rotate: open ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  <ChevronRightIcon sx={{ fontSize: '1rem' }} />
                </motion.span>
              </ButtonBase>
            ) : null}
          </Box>
        ) : null}
        {row.label != null ? (
          <InfoLabel id={`${id}label`} label={row.label} tooltip={row.tooltip} iconMargin={2} />
        ) : null}
      </Box>
      <Box role="cell" sx={V3_CELL_SX}>
        <Cell value={row.v3} loading={row.loading} />
      </Box>
      <Box role="cell" sx={V4_CELL_SX}>
        <Cell value={row.v4} loading={row.loading} />
      </Box>
    </Box>
  );

  if (!expandable) return line;

  return (
    <Box data-open={open} sx={GROUP_SX}>
      {line}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="details"
            id={`${id}details`}
            role="rowgroup"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
            transition={EXPAND_TRANSITION}
            style={{ overflow: 'hidden' }}
          >
            {details.map((item, index) => (
              <PreviewRow
                key={item.id}
                row={item}
                gutter={gutter}
                divider={index < details.length - 1}
                detail
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Box>
  );
};

export const V4MigrationPreview = ({ rows, title }: V4MigrationPreviewProps) => {
  const gutter = rows.some((row) => row.details?.length);

  return (
    <Box sx={ROOT_SX}>
      {title ? (
        <Typography variant="inherit" component="h2" sx={TITLE_SX}>
          {title}
        </Typography>
      ) : null}
      <Box sx={CARD_SX}>
        <Box role="table" data-gutter={gutter} sx={TABLE_SX}>
          <Box role="row" data-header data-divider sx={ROW_SX}>
            <Box role="columnheader" sx={LABEL_CELL_SX} />
            <Box role="columnheader" sx={V3_CELL_SX}>
              <VersionLogo version="V3" />
            </Box>
            <Box role="columnheader" sx={V4_CELL_SX}>
              <VersionLogo version="V4" />
            </Box>
          </Box>
          {rows.map((row, index) => (
            <PreviewRow key={row.id} row={row} gutter={gutter} divider={index < rows.length - 1} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
