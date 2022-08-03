import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';
import { Link } from '../primitives/Link';

type BorrowCapTooltipProps = TextWithTooltipProps & {
  borrowCap: AssetCapData;
};

export const BorrowCapTooltip = ({ borrowCap, ...rest }: BorrowCapTooltipProps) => {
  // Don't show a tooltip when less than 98% utilized
  if (borrowCap.percentUsed < 98) return null;

  const renderTooltipContent = () => (
    <>
      {borrowCap.isMaxed ? (
        <Trans>Protocol borrow cap at 100% for this asset. Further supply unavailable.</Trans>
      ) : (
        <Trans>
          Borrowing of this asset is limited to a certain amount to minimize liquidity pool
          insolvency.
        </Trans>
      )}
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
        <Trans>Learn more</Trans>
      </Link>
    </>
  );

  return borrowCap.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        {renderTooltipContent()}
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>{renderTooltipContent()}</TextWithTooltip>
  );
};
