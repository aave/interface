import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';
import { SAFETY_MODULE_TOKENS } from '../constants';

export function SafetyModuleSwapWarning({ state }: { state: SwapState }) {
  const isSwappingSafetyModuleToken = SAFETY_MODULE_TOKENS.includes(
    state.sourceToken.symbol.toLowerCase()
  );
  if (!isSwappingSafetyModuleToken) return null;

  return (
    <Warning severity="error" icon={false} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="caption">
        <Trans>
          For swapping safety module assets please unstake your position{' '}
          <Link href="/safety-module" onClick={() => close()}>
            here
          </Link>
          .
        </Trans>
      </Typography>
    </Warning>
  );
}
