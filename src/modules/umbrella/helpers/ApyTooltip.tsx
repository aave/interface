import { Trans } from '@lingui/macro';
import { Link } from 'src/components/primitives/Link';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const ApyTooltip = () => {
  return (
    <TextWithTooltip text={<Trans>APY</Trans>}>
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
