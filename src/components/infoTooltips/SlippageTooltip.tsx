import { Trans } from '@lingui/macro';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const SlippageTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip
      event={{
        eventName: GENERAL.TOOL_TIP,
        eventParams: { tooltip: 'Slippage Tollerance' },
      }}
      {...rest}
    >
      <Trans>
        Slippage is the difference between the quoted and received amounts from changing market
        conditions between the moment the transaction is submitted and its verification.
      </Trans>
    </TextWithTooltip>
  );
};
