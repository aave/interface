import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';
import { Link } from '../primitives/Link';

type SupplyCapTooltipProps = TextWithTooltipProps & {
  supplyCap: AssetCapData;
};

export const SupplyCapTooltip = ({ supplyCap, ...rest }: SupplyCapTooltipProps) => {
  // Don't show a tooltip when less than 98% utilized
  if (supplyCap.percentUsed < 98) return null;

  const renderTooltipContent = () => (
    <>
      {supplyCap.isMaxed ? (
        <Trans>Protocol supply cap at 100% for this asset. Further supply unavailable.</Trans>
      ) : (
        <Trans>
          Asset supply is limited to a certain amount to reduce protocol exposure to the asset and
          to help manage risks involved.
        </Trans>
      )}
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </>
  );

  return supplyCap.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        {renderTooltipContent()}
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>{renderTooltipContent()}</TextWithTooltip>
  );
};
