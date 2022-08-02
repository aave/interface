import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type BorrowCapTooltipProps = TextWithTooltipProps & {
  borrowCap: AssetCapData;
};

export const BorrowCapTooltip = ({ borrowCap, ...rest }: BorrowCapTooltipProps) =>
  borrowCap.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        <>
          <Trans>Protocol borrow cap at 100% for this asset. Further supply unavailable.</Trans>
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
          Borrowing of this asset is limited to a certain amount to minimize liquidity pool
          insolvency.
        </Trans>
        <br />
        <Link href="#" target="_blank" rel="noopener">
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  );
