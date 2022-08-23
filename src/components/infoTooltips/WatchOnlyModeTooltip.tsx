import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const WatchOnlyModeToolTip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Watch-only mode allows to see address positions in Aave, but you won&apos;t be able to
        perform transactions.
      </Trans>
    </TextWithTooltip>
  );
};
