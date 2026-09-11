import { Trans } from '@lingui/macro';
import { TypographyProps } from '@mui/material';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const StakedUnderlyingTooltip = ({ variant }: { variant?: TypographyProps['variant'] }) => {
  return (
    <TextWithTooltip text={<Trans>Staked Underlying</Trans>} variant={variant}>
      <>
        <Trans>
          Total amount of underlying assets staked. This number represents the combined sum of your
          original asset and the corresponding aTokens staked in Umbrella.
        </Trans>
      </>
    </TextWithTooltip>
  );
};
