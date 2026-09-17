import { Trans } from '@lingui/macro';
import { TypographyProps } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const ApyTooltip = ({ variant }: { variant?: TypographyProps['variant'] }) => {
  return (
    <TextWithTooltip text={<Trans>APY</Trans>} variant={variant}>
      <>
        <Trans>
          Reward APY adjusts with total staked amount, following a curve that targets optimal
          staking levels.
        </Trans>{' '}
        <Link
          href="https://aave.com/docs/primitives/umbrella#rewards-and-safety-incentives"
          underline="always"
        >
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  );
};
