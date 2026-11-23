import { Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import { Children, ReactNode } from 'react';
import { ApySparkline } from 'src/components/charts/ApySparkline';
import { SparklineDatum } from 'src/components/charts/SparklineChart';
import { Curator, CuratorBy } from 'src/components/CuratorBy';
import { Link } from 'src/components/primitives/Link';
import { TitleWithSubtitle } from 'src/components/TitleWithSubtitle';
import { figSurfaceShadow } from 'src/utils/figmaColors';

const CARD_RADIUS = '0.625rem';

export const CARD_SURFACE_SX = {
  borderRadius: CARD_RADIUS,
  bgcolor: 'table-bg',
  boxShadow: figSurfaceShadow('shadow-stroke-1'),
} as const;

const STRETCHED_SX = {
  position: 'static',
  display: 'flex',
  justifyContent: 'flex-start',
  minWidth: 0,
  color: 'inherit',
  textAlign: 'left',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderRadius: CARD_RADIUS,
  },
  '&:focus-visible, &.Mui-focusVisible': {
    outline: 'none',
    '&::after': { outline: '2px solid currentColor', outlineOffset: '3px' },
  },
} as const;

interface OpportunityCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  curators?: Curator[];
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  apyLabel: ReactNode;
  apy?: ReactNode;
  apyAverage?: ReactNode;
  chart?: ReactNode;
  history?: SparklineDatum[];
  historyLoading?: boolean;
  historyBaselineLabel?: ReactNode;
  historyFadeLeft?: boolean;
  chartColor?: string;
  loading?: boolean;
  children?: ReactNode;
}

export const OpportunityCard = ({
  title,
  subtitle,
  curators,
  leading,
  trailing,
  href,
  onClick,
  disabled = false,
  apyLabel,
  apy,
  apyAverage,
  chart,
  history,
  historyLoading,
  historyBaselineLabel,
  historyFadeLeft,
  chartColor,
  loading,
  children,
}: OpportunityCardProps) => {
  const interactive = !disabled && !loading && Boolean(href || onClick);

  const identity =
    loading || !title ? (
      <Skeleton variant="rectangular" width={140} height={16} sx={{ borderRadius: '0.375rem' }} />
    ) : (
      <TitleWithSubtitle title={title} subtitle={subtitle} />
    );

  const link = !interactive ? (
    <Box sx={{ display: 'flex', minWidth: 0 }}>{identity}</Box>
  ) : href ? (
    <Link href={href} noLinkStyle sx={STRETCHED_SX}>
      {identity}
    </Link>
  ) : (
    <ButtonBase disableRipple onClick={onClick} sx={STRETCHED_SX}>
      {identity}
    </ButtonBase>
  );

  const apyBlock = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
      <Typography variant="base" color="fg-3">
        {apyLabel}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            width={88}
            height="1.35rem"
            sx={{ borderRadius: '0.375rem' }}
          />
        ) : (
          <Typography
            variant="h3"
            color="fg-1"
            component="div"
            sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '1.35rem' }}
          >
            {apy}
          </Typography>
        )}
        {apyAverage ? (
          <Typography
            variant="caption"
            color="fg-3"
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.25rem',
              letterSpacing: 0,
              lineHeight: 1.35,
            }}
          >
            {apyAverage}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );

  const chartNode =
    chart ??
    (chartColor ? (
      <ApySparkline
        history={history}
        loading={loading || historyLoading}
        color={chartColor}
        baselineLabel={historyBaselineLabel}
        fadeLeft={historyFadeLeft}
      />
    ) : null);

  const rows = Children.toArray(children);

  return (
    <Box
      sx={{
        position: 'relative',
        isolation: 'isolate',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        p: '1.25rem',
        ...CARD_SURFACE_SX,
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 100ms ease',
        ...(interactive && {
          '&:hover, &:has(:focus-visible)': { bgcolor: 'table-item-hover-1' },
        }),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {leading ? <Box sx={{ display: 'flex', flexShrink: 0 }}>{leading}</Box> : null}
        {link}
        {curators?.length && !loading ? (
          <Box sx={{ display: 'flex', flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <CuratorBy curators={curators} />
          </Box>
        ) : null}
        {trailing ? (
          <Box sx={{ display: 'flex', flexShrink: 0, ml: 'auto' }}>{trailing}</Box>
        ) : null}
      </Box>
      {chartNode ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', xsm: 'repeat(2, minmax(0, 1fr))' },
            alignItems: 'center',
            rowGap: '1rem',
          }}
        >
          {apyBlock}
          <Box sx={{ minWidth: 0, transform: { xsm: 'translateY(0.5rem)' } }}>{chartNode}</Box>
        </Box>
      ) : (
        apyBlock
      )}
      {rows.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            pt: '1.25rem',
            borderTop: '1px solid',
            borderColor: 'border-0',
            '& button, & a': { position: 'relative', zIndex: 2 },
          }}
        >
          {rows}
        </Box>
      ) : null}
    </Box>
  );
};
