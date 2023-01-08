import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { AssetCapData } from 'src/hooks/useAssetCaps';

import { Link } from '../primitives/Link';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type DebtCeilingMaxedTooltipProps = TextWithTooltipProps & {
  debtCeiling: AssetCapData;
};

export const DebtCeilingMaxedTooltip = ({ debtCeiling, ...rest }: DebtCeilingMaxedTooltipProps) => {
  if (!debtCeiling || !debtCeiling.isMaxed) return null;

  return (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="error.main" iconSize={18}>
        <>
          <Trans>
            Protocol debt ceiling is at 100% for this asset. Further borrowing against this asset is
            unavailable.
          </Trans>{' '}
          <Link
            href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
            underline="always"
          >
            <Trans>Learn more</Trans>
          </Link>
        </>
      </TextWithTooltip>
    </Box>
  );
};
