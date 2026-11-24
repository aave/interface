import { Trans } from '@lingui/macro';
import { Box, ButtonBase, Skeleton, Theme, Typography } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { ReactNode } from 'react';
import { InfoCircleIcon } from 'src/components/icons/InfoCircleIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { figVars } from 'src/utils/figmaColors';
import { insetHighlightActive, insetHighlightBase } from 'src/utils/insetHighlight';

const LIST_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  m: '-0.25rem -0.625rem',
  p: '0.25rem 0.625rem',
} as const;

const GROUP_HEADING_SX = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: 'fg-3',
} as const;

const GROUP_LABEL_SX = { ...GROUP_HEADING_SX, display: 'block', mb: '0.25rem' } as const;

const GROUP_TOOLTIP_WRAPPER = {
  sx: { mb: '0.25rem', '& .MuiIconButton-root': { height: 0 } },
} as const;

const INFO_ICON = <InfoCircleIcon />;

const rowSx = (theme: Theme): SystemStyleObject<Theme> => ({
  ...insetHighlightBase({ theme, radius: '0.5rem', left: '-0.625rem', right: '-0.625rem' }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '0.75rem',
  width: '100%',
  height: '4rem',
  textAlign: 'left',
  '&:hover::before, &.Mui-focusVisible::before': insetHighlightActive(
    figVars['table-item-hover-2']
  ),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '3.5rem',
    right: 0,
    bottom: 0,
    height: '1px',
    backgroundColor: figVars['border-0'],
  },
  '&:last-of-type::after, &:hover::after, &:has(+ :hover)::after': { display: 'none' },
  '&.Mui-disabled': { opacity: 0.5 },
});

const CONTENT_SX = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '0.5rem',
} as const;

const LEFT_SX = { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 0 } as const;
const RIGHT_SX = { ...LEFT_SX, alignItems: 'flex-end' } as const;

const EMPTY_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  py: '3rem',
  textAlign: 'center',
} as const;

export const AssetList = ({ children }: { children: ReactNode }) => (
  <Box sx={LIST_SX}>{children}</Box>
);

export const AssetListGroup = ({
  label,
  tooltip,
  children,
}: {
  label: ReactNode;
  tooltip?: ReactNode;
  children: ReactNode;
}) => (
  <Box>
    {tooltip ? (
      <TextWithTooltip
        component="h3"
        variant="inherit"
        text={label}
        sx={GROUP_HEADING_SX}
        icon={INFO_ICON}
        iconSize={16}
        iconColor="fg-4"
        iconMargin={1.5}
        wrapperProps={GROUP_TOOLTIP_WRAPPER}
      >
        <>{tooltip}</>
      </TextWithTooltip>
    ) : (
      <Typography variant="inherit" component="h3" sx={GROUP_LABEL_SX}>
        {label}
      </Typography>
    )}
    {children}
  </Box>
);

export const AssetListItem = ({
  icon,
  left,
  right,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  left: ReactNode;
  right?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <ButtonBase onClick={onClick} disabled={disabled} sx={rowSx}>
    {icon}
    <Box sx={CONTENT_SX}>
      <Box sx={LEFT_SX}>{left}</Box>
      {right ? <Box sx={RIGHT_SX}>{right}</Box> : null}
    </Box>
  </ButtonBase>
);

export const AssetListItemSkeleton = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '4rem' }}>
    <Skeleton variant="circular" width={44} height={44} />
    <Box sx={{ ...LEFT_SX, flex: 1 }}>
      <Skeleton variant="rectangular" width={96} height={14} sx={{ borderRadius: '0.25rem' }} />
      <Skeleton variant="rectangular" width={48} height={14} sx={{ borderRadius: '0.25rem' }} />
    </Box>
  </Box>
);

export const AssetListEmpty = ({ query, fallback }: { query: string; fallback?: ReactNode }) => {
  const trimmed = query.trim();

  return (
    <Box sx={EMPTY_SX}>
      <Typography variant="h5" color="fg-1">
        {trimmed ? <Trans>No Results Found for “{trimmed}”</Trans> : fallback}
      </Typography>
      {trimmed && (
        <Typography variant="base" color="fg-3">
          <Trans>Try adjusting your search</Trans>
        </Typography>
      )}
    </Box>
  );
};
