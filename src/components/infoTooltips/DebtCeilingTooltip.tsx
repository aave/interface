import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link } from '@mui/material';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type DebtCeilingTooltipProps = TextWithTooltipProps & {
  debtCeiling: AssetCapData;
};

export const DebtCeilingTooltip = ({ debtCeiling, ...rest }: DebtCeilingTooltipProps) => {
  return debtCeiling.isMaxed ? (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="error.main" iconSize={18}>
        <>
          <Trans>
            Protocol debt ceiling is at 100% for this asset. Futher borrowing against this asset is
            unavailable.
          </Trans>
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
          Debt ceiling limits the amount possible to borrow against this asset by protocol users.
        </Trans>
        <br />
        <Link
          href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
          target="_blank"
          rel="noopener"
        >
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  );
};
