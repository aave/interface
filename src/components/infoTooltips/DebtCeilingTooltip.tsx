import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';
import { Link } from '../primitives/Link';

type DebtCeilingTooltipProps = TextWithTooltipProps & {
  debtCeiling: AssetCapData;
};

export const DebtCeilingTooltip = ({ debtCeiling, ...rest }: DebtCeilingTooltipProps) => {
  // Don't show a tooltip when less than 98% utilized
  if (debtCeiling.percentUsed < 98) return null;

  const renderTooltipContent = () => (
    <>
      {debtCeiling.isMaxed ? (
        <Trans>
          Protocol debt ceiling is at 100% for this asset. Futher borrowing against this asset is
          unavailable.
        </Trans>
      ) : (
        <Trans>
          Debt ceiling limits the amount possible to borrow against this asset by protocol users.
        </Trans>
      )}
      <br />
      <Link href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power">
        <Trans>Learn more</Trans>
      </Link>
    </>
  );

  return debtCeiling.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="error.main" iconSize={18}>
        {renderTooltipContent()}
      </TextWithTooltip>
    </Box>
  ) : (
    <TextWithTooltip {...rest}>{renderTooltipContent()}</TextWithTooltip>
  );
};
