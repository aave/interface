import { Trans } from '@lingui/macro';
import { Divider } from '@mui/material';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type SlippageTooltipProps = TextWithTooltipProps & {
  headerContent?: React.ReactNode;
};

export const SlippageTooltip = ({ headerContent, ...rest }: SlippageTooltipProps) => {
  return (
    <TextWithTooltip
      event={{
        eventName: GENERAL.TOOL_TIP,
        eventParams: { tooltip: 'Slippage Tollerance' },
      }}
      {...rest}
    >
      <>
        {headerContent && (
          <>
            {headerContent}
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Trans>
          Slippage is the difference between the quoted and received amounts from changing market
          conditions between the moment the transaction is submitted and its verification.
        </Trans>
      </>
    </TextWithTooltip>
  );
};
