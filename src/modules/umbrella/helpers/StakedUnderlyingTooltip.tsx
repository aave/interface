import { Trans } from '@lingui/macro';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const StakedUnderlyingTooltip = () => {
  return (
    <TextWithTooltip text={<Trans>Staked Underlying</Trans>}>
      <>
        <Trans>
          Total amount of underlying assets staked. This number represents the combined sum of your
          original asset and the corresponding aTokens staked in Umbrella.
        </Trans>
      </>
    </TextWithTooltip>
  );
};
