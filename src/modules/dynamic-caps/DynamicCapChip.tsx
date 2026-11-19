import { CheckIcon, TrendingUpIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Tooltip, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { ReactElement } from 'react';
import { CARD_CLASS, PopperComponent } from 'src/components/ContentWithTooltip';
import { compactNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { figVars } from 'src/utils/figmaColors';

import { DYNAMIC_CAPS_LEARN_MORE_URL, DynamicCap } from './useDynamicCap';

export const formatCapAmount = (value: number): string => {
  if (value === 0) return '0';
  const { prefix, postfix } = compactNumber({ value });
  return `${prefix}${postfix}`;
};

type DynamicCapChipProps = {
  sx?: SxProps<Theme>;
  /** Icon only, for columns with no room for the label. Pair it with the tooltip. */
  compact?: boolean;
};

/** The label that marks a cap as dynamic. Neutral on purpose: it describes, it does not warn. */
export const DynamicCapChip = ({ sx, compact }: DynamicCapChipProps) => (
  <Box
    component="span"
    data-dyncap="chip"
    aria-label={compact ? 'Dynamic cap' : undefined}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      height: '22px',
      minWidth: '22px',
      px: compact ? 0 : '8px',
      borderRadius: '2.375rem',
      whiteSpace: 'nowrap',
      color: figVars['green-1'],
      backgroundColor: `color-mix(in srgb, ${figVars['green-1']} 10%, transparent)`,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${figVars['green-1']} 30%, transparent)`,
      ...sx,
    }}
  >
    <SvgIcon sx={{ fontSize: '12px' }}>
      <TrendingUpIcon />
    </SvgIcon>
    {!compact && (
      <Typography variant="subheader2" color="inherit" sx={{ lineHeight: 1 }}>
        <Trans>Dynamic cap</Trans>
      </Typography>
    )}
  </Box>
);

/** What a dynamic cap means for this reserve right now, in two sentences. */
export const DynamicCapSummary = ({ cap }: { cap: DynamicCap }) => {
  const currentCap = formatCapAmount(cap.currentCap);
  const availableNow = formatCapAmount(cap.availableNow);
  const maxCap = formatCapAmount(cap.maxCap);

  if (cap.isAtMaxCap) {
    return (
      <Trans>
        Current cap {currentCap}, {availableNow} available now. The cap has reached its maximum and
        will not rise further.
      </Trans>
    );
  }

  return (
    <Trans>
      Current cap {currentCap}, {availableNow} available now. The cap rises automatically as
      borrowing grows, up to a maximum of {maxCap}.
    </Trans>
  );
};

/**
 * A reserve's dynamic cap explained on hover, around any trigger. In lists, where there is no room
 * for a notice per row.
 */
export const DynamicCapTooltip = ({
  cap,
  children,
}: {
  cap: DynamicCap;
  children: ReactElement;
}) => (
  <Tooltip
    arrow
    placement="bottom"
    PopperComponent={PopperComponent}
    componentsProps={{
      popper: {
        className: CARD_CLASS,
        // The row under the chip is a link: a click inside the tooltip must not follow it.
        onClick: (e) => e.stopPropagation(),
      },
    }}
    title={
      <Box data-dyncap="market-tooltip">
        <Typography variant="subheader2" component="div" sx={{ mb: 1 }}>
          <Trans>Dynamic borrow cap</Trans>
        </Typography>
        <DynamicCapSummary cap={cap} />{' '}
        <Link href={DYNAMIC_CAPS_LEARN_MORE_URL} underline="always">
          <Trans>Learn more</Trans>
        </Link>
      </Box>
    }
  >
    {children}
  </Tooltip>
);

/** The chip with its explanation on hover. */
export const DynamicCapChipWithTooltip = ({
  cap,
  sx,
  compact,
}: DynamicCapChipProps & { cap: DynamicCap }) => (
  <DynamicCapTooltip cap={cap}>
    <Box component="span" sx={{ display: 'inline-flex' }}>
      <DynamicCapChip sx={sx} compact={compact} />
    </Box>
  </DynamicCapTooltip>
);

/** The markets list's Dynamic cap column: a check on reserves with a dynamic cap, a dash elsewhere. */
export const DynamicCapCheck = ({ cap }: { cap: DynamicCap | null }) =>
  cap ? (
    <DynamicCapTooltip cap={cap}>
      <Box
        component="span"
        data-dyncap="column"
        aria-label="Dynamic cap"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          color: figVars['green-1'],
          backgroundColor: `color-mix(in srgb, ${figVars['green-1']} 10%, transparent)`,
        }}
      >
        <SvgIcon sx={{ fontSize: '14px' }}>
          <CheckIcon />
        </SvgIcon>
      </Box>
    </DynamicCapTooltip>
  ) : (
    <NoData variant="h5" />
  );
