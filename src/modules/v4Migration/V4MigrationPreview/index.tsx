import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { SKELETON } from 'src/components/DynamicCard/DescriptionItem';
import { AaveLogo } from 'src/components/icons/AaveLogo';
import { InfoLabel } from 'src/components/InfoLabel';
import { NoData } from 'src/components/primitives/NoData';
import { CARD_SURFACE_SX, figVars } from 'src/utils/figmaColors';

export interface V4MigrationPreviewRow {
  id: string;
  label: ReactNode;
  tooltip?: ReactNode;
  v3?: ReactNode;
  v4?: ReactNode;
  loading?: boolean;
}

export interface V4MigrationPreviewProps {
  rows: V4MigrationPreviewRow[];
  title?: ReactNode;
}

const INSET = '1.25rem';
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

const TABLE_SX = { display: 'flex', flexDirection: 'column', minWidth: 'max-content' } as const;

const LABEL_CELL_SX = {
  flex: '1 0 auto',
  display: 'flex',
  alignItems: 'center',
  pl: INSET,
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

const v4CellSx = (divider: boolean) =>
  ({
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
      bottom: divider ? '1px' : 0,
      width: '1px',
      bgcolor: 'border-0',
    },
  } as const);

const rowSx = (height: string, divider: boolean) =>
  ({
    position: 'relative',
    display: 'flex',
    height,
    ...(divider && {
      '&::after': {
        content: '""',
        position: 'absolute',
        left: INSET,
        right: INSET,
        bottom: 0,
        height: '1px',
        bgcolor: 'border-0',
      },
    }),
  } as const);

const HEADER_ROW_SX = rowSx('3rem', true);
const ROW_SX = rowSx('3.125rem', true);
const LAST_ROW_SX = rowSx('3.125rem', false);
const V4_CELL_SX = v4CellSx(true);
const LAST_V4_CELL_SX = v4CellSx(false);

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

export const V4MigrationPreview = ({ rows, title }: V4MigrationPreviewProps) => (
  <Box sx={ROOT_SX}>
    {title ? (
      <Typography variant="inherit" component="h2" sx={TITLE_SX}>
        {title}
      </Typography>
    ) : null}
    <Box sx={CARD_SX}>
      <Box role="table" sx={TABLE_SX}>
        <Box role="row" sx={HEADER_ROW_SX}>
          <Box role="columnheader" sx={LABEL_CELL_SX} />
          <Box role="columnheader" sx={V3_CELL_SX}>
            <VersionLogo version="V3" />
          </Box>
          <Box role="columnheader" sx={V4_CELL_SX}>
            <VersionLogo version="V4" />
          </Box>
        </Box>
        {rows.map((row, index) => {
          const last = index === rows.length - 1;

          return (
            <Box key={row.id} role="row" sx={last ? LAST_ROW_SX : ROW_SX}>
              <Box role="rowheader" sx={LABEL_CELL_SX}>
                <InfoLabel label={row.label} tooltip={row.tooltip} iconMargin={2} />
              </Box>
              <Box role="cell" sx={V3_CELL_SX}>
                <Cell value={row.v3} loading={row.loading} />
              </Box>
              <Box role="cell" sx={last ? LAST_V4_CELL_SX : V4_CELL_SX}>
                <Cell value={row.v4} loading={row.loading} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  </Box>
);
