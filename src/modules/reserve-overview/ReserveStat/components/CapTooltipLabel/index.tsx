import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';
import { tooltipLabelProps } from 'src/components/infoTooltips/tooltipLabelProps';
import { Link } from 'src/components/primitives/Link';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { GENERAL } from 'src/utils/events';

interface CapTooltipLabelProps {
  label: ReactNode;
  tooltip: string;
  reserve: ReserveWithId;
  children: ReactNode;
}

export const CapTooltipLabel = ({ label, tooltip, reserve, children }: CapTooltipLabelProps) => (
  <TextWithTooltip
    {...tooltipLabelProps}
    text={label}
    event={{
      eventName: GENERAL.TOOL_TIP,
      eventParams: {
        tooltip,
        asset: reserve.underlyingToken.address,
        assetName: reserve.underlyingToken.name,
      },
    }}
  >
    <>
      {children}{' '}
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps" underline="always">
        <Trans>Learn more</Trans>
      </Link>
    </>
  </TextWithTooltip>
);
