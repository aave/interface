import { Trans } from '@lingui/macro';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const SharesTooltip = () => {
  return (
    <TextWithTooltip text={<Trans>Shares</Trans>}>
      <>
        <Trans>
          Shares are Umbrella Stake Tokens you receive when staking. They represent your ownership
          in the pool and determine how much underlying you can redeem.
        </Trans>{' '}
      </>
    </TextWithTooltip>
  );
};
