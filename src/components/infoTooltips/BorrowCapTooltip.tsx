import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';
import { Link } from '../primitives/Link';

type BorrowCapTooltipProps = TextWithTooltipProps & {
  borrowCap: AssetCapData;
  useDefaultTooltip?: boolean;
};

export const BorrowCapTooltip = ({
  borrowCap,
  useDefaultTooltip = false,
  ...rest
}: BorrowCapTooltipProps) => {
  // TODO: remove after updating content on line 32
  // Don't show a tooltip when less than 98% utilized
  // if (borrowCap.percentUsed < 98) return null;

  const renderTooltipContent = () => (
    <>
      {borrowCap.isMaxed ? (
        <Trans>Protocol borrow cap at 100% for this asset. Further supply unavailable.</Trans>
      ) : borrowCap.percentUsed > 98 ? (
        <Trans>
          Borrowing of this asset is limited to a certain amount to minimize liquidity pool
          insolvency.
        </Trans>
      ) : (
        <Trans>Borrowing is in good health</Trans>
      )}
      <br />
      <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps" underline="always">
        <Trans>Learn more</Trans>
      </Link>
    </>
  );

  // TODO: Have a fallback when < 98% usage
  return borrowCap.isMaxed && !useDefaultTooltip ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
        {renderTooltipContent()}
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>{renderTooltipContent()}</TextWithTooltip>
  );
};
