import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const ReadOnlyModeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Read-only mode allows to see address positions in Mooncake Finance, but you won&apos;t be
        able to perform transactions.
      </Trans>
    </TextWithTooltip>
  );
};
