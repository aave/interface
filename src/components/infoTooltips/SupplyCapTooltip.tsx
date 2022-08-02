import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type SupplyCapTooltipProps = TextWithTooltipProps & {
  supplyCap: AssetCapData;
};

export const SupplyCapTooltip = ({ supplyCap, ...rest }: SupplyCapTooltipProps) => {
  return supplyCap.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        <>
          <Trans>Protocol supply cap at 100% for this asset. Further supply unavailable.</Trans>
          <br />
          <Link href="#" target="_blank" rel="noopener">
            <Trans>Learn more</Trans>
          </Link>
        </>
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>
      <>
        <Trans>
          Asset supply is limited to a certain amount to reduce protocol exposure to the asset and
          to help manage risks involved.
        </Trans>
        <br />
        <Link href="#" target="_blank" rel="noopener">
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  );
};
