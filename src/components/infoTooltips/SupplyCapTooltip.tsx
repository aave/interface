import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';
import { Link } from '../primitives/Link';

type SupplyCapTooltipProps = TextWithTooltipProps & {
  supplyCap: AssetCapData;
  useDefaultTooltip?: boolean;
};

export const SupplyCapTooltip = ({
  supplyCap,
  useDefaultTooltip = false,
  ...rest
}: SupplyCapTooltipProps) => {
  // TODO: remove after updating content on line 32
  // Don't show a tooltip when less than 98% utilized
  // if (supplyCap.percentUsed < 98) return null;

  const renderTooltipContent = () => (
    <>
      {supplyCap.isMaxed ? (
        <Trans>Protocol supply cap at 100% for this asset. Further supply unavailable.</Trans>
      ) : supplyCap.percentUsed > 98 ? (
        <Trans>
          Asset supply is limited to a certain amount to reduce protocol exposure to the asset and
          to help manage risks involved.
        </Trans>
      ) : (
        <Trans>Supply is in good health</Trans>
      )}
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps" underline="always">
        <Trans>Learn more</Trans>
      </Link>
    </>
  );

  // TODO: Have a fallback when < 98% usage
  return supplyCap.isMaxed && !useDefaultTooltip ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        {renderTooltipContent()}
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>{renderTooltipContent()}</TextWithTooltip>
  );
};
