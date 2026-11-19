import { Trans } from '@lingui/macro';
import { Alert, AlertProps } from '@mui/material';
import { Link } from 'src/components/primitives/Link';

import { formatCapAmount } from './DynamicCapChip';
import { DYNAMIC_CAPS_LEARN_MORE_URL, DynamicCap } from './useDynamicCap';

const LearnMore = () => (
  <Link href={DYNAMIC_CAPS_LEARN_MORE_URL} underline="always">
    <Trans>Learn more</Trans>
  </Link>
);

/**
 * Reserve page notice, above Borrow info. The figures under it are left exactly as they are; the
 * notice is what tells the reader a nearly full cap is this reserve's normal state.
 */
export const DynamicCapNotice = ({
  cap,
  measuredAgainstMaxCap,
  ...rest
}: AlertProps & {
  cap: DynamicCap;
  /** The figures under the notice are read against the max cap, not the current cap. */
  measuredAgainstMaxCap?: boolean;
}) => {
  const maxCap = formatCapAmount(cap.maxCap);

  return (
    <Alert severity="info" data-dyncap="notice" sx={{ width: '100%', mb: '40px' }} {...rest}>
      {cap.isAtMaxCap ? (
        <Trans>
          <b>This asset&apos;s dynamic borrow cap is at its maximum.</b> The cap of {maxCap} will
          not rise further.
        </Trans>
      ) : cap.isCurrentCapReached ? (
        <Trans>
          <b>This asset has a dynamic borrow cap.</b> The current cap is fully used. It rises
          automatically as borrowing grows, up to a maximum of {maxCap}.
        </Trans>
      ) : measuredAgainstMaxCap ? (
        <Trans>
          <b>This asset has a dynamic borrow cap.</b> The current cap rises automatically as
          borrowing grows, up to a maximum of {maxCap}. Total borrowed below is shown against that
          maximum.
        </Trans>
      ) : (
        <Trans>
          <b>This asset has a dynamic borrow cap.</b> The cap rises automatically as borrowing
          grows, up to a maximum of {maxCap}. A cap near 100% does not mean borrowing is closed.
        </Trans>
      )}{' '}
      <LearnMore />
    </Alert>
  );
};

/** Markets list banner: one per market, since the list has no room to explain it per row. */
export const DynamicCapsMarketBanner = (props: AlertProps) => (
  <Alert severity="info" data-dyncap="banner" {...props}>
    <Trans>
      <b>Borrow caps on this market are dynamic.</b> Each cap rises automatically as borrowing
      grows, up to a maximum per asset, so a cap near 100% does not mean borrowing is closed.
    </Trans>{' '}
    <LearnMore />
  </Alert>
);

type DynamicCapBorrowNoteProps = AlertProps & {
  cap: DynamicCap;
  symbol: string;
};

/**
 * Borrow flow copy, in the borrow modal and under the reserve's actions. Takes the place of the
 * "borrow cap is nearly reached" and "borrow cap is at 100%" warnings, which on a dynamic cap would
 * show on almost every borrow.
 *
 * No timing on purpose: the next raise is not guaranteed at a fixed moment, and naming one would
 * point users at it.
 */
export const DynamicCapBorrowNote = ({ cap, symbol, ...rest }: DynamicCapBorrowNoteProps) => {
  const availableNow = formatCapAmount(cap.availableNow);
  const maxCap = formatCapAmount(cap.maxCap);
  // Nothing can be borrowed until the next raise. A warning: the reader came here to borrow.
  const isWaitingForRaise = cap.isCurrentCapReached && !cap.isAtMaxCap;

  return (
    <Alert
      severity={cap.isAtMaxCap || isWaitingForRaise ? 'warning' : 'info'}
      data-size="small"
      data-dyncap="borrow-note"
      sx={{ mb: 6, width: '100%' }}
      {...rest}
    >
      {cap.isAtMaxCap ? (
        <Trans>
          {availableNow} {symbol} can be borrowed now. This asset&apos;s dynamic borrow cap has
          reached its maximum of {maxCap} and will not rise further.
        </Trans>
      ) : isWaitingForRaise ? (
        <Trans>
          The current borrow cap is fully used, so no {symbol} can be borrowed right now. This is a
          dynamic cap: it is raised automatically, up to {maxCap}.
        </Trans>
      ) : (
        <Trans>
          {availableNow} {symbol} can be borrowed now. This asset has a dynamic borrow cap that
          rises automatically as borrowing grows, up to {maxCap}.
        </Trans>
      )}{' '}
      {cap.isAtMaxCap ? null : isWaitingForRaise ? (
        <LearnMore />
      ) : (
        <Link href={DYNAMIC_CAPS_LEARN_MORE_URL} underline="always">
          <Trans>Borrowing more than this at once?</Trans>
        </Link>
      )}
    </Alert>
  );
};
